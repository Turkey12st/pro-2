import { supabase } from '@/integrations/supabase/client';

// Rate limiting configuration
const RATE_LIMITS = {
  login: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  employee_create: { requests: 10, windowMs: 60 * 1000 }, // 10 requests per minute
  financial_transaction: { requests: 20, windowMs: 60 * 1000 }, // 20 requests per minute
  sensitive_data_access: { requests: 50, windowMs: 60 * 1000 } // 50 requests per minute
};

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

export class SecurityService {
  // Rate limiting function
  static checkRateLimit(
    userId: string, 
    action: keyof typeof RATE_LIMITS
  ): { allowed: boolean; resetTime?: number } {
    const limit = RATE_LIMITS[action];
    const key = `${userId}:${action}`;
    const now = Date.now();
    
    const current = rateLimitStore.get(key);
    
    // If no previous record or window expired, reset
    if (!current || now > current.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs });
      return { allowed: true };
    }
    
    // If within limit, increment and allow
    if (current.count < limit.requests) {
      current.count++;
      return { allowed: true };
    }
    
    // Rate limit exceeded
    return { allowed: false, resetTime: current.resetTime };
  }

  // Log security events
  static async logSecurityEvent(
    action: string,
    details: {
      userId?: string;
      tableName?: string;
      recordId?: string;
      ipAddress?: string;
      userAgent?: string;
      success: boolean;
      errorMessage?: string;
    }
  ) {
    try {
      await supabase.from('security_audit_log').insert({
        user_id: details.userId,
        action,
        table_name: details.tableName,
        record_id: details.recordId,
        ip_address: details.ipAddress,
        user_agent: details.userAgent,
        new_values: {
          success: details.success,
          error_message: details.errorMessage,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Check for suspicious activity patterns
  static async detectSuspiciousActivity(userId: string): Promise<{
    isSuspicious: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    
    try {
      // Check for multiple failed attempts in short time
      const { data: recentFailures } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())
        .like('new_values->error_message', '%failed%');

      if (recentFailures && recentFailures.length > 5) {
        reasons.push('Multiple failed attempts detected');
      }

      // Check for unusual access patterns
      const { data: recentActions } = await supabase
        .from('security_audit_log')
        .select('action, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (recentActions && recentActions.length > 30) {
        reasons.push('Unusually high activity volume');
      }

      // Check for privilege escalation attempts
      const privilegeActions = recentActions?.filter(action => 
        action.action.includes('role') || 
        action.action.includes('permission') ||
        action.action.includes('admin')
      );

      if (privilegeActions && privilegeActions.length > 3) {
        reasons.push('Multiple privilege-related actions detected');
      }

      return {
        isSuspicious: reasons.length > 0,
        reasons
      };
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      return { isSuspicious: false, reasons: [] };
    }
  }

  // Generate security report
  static async generateSecurityReport(startDate: Date, endDate: Date) {
    try {
      const { data: auditLogs } = await supabase
        .from('security_audit_log')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (!auditLogs) return null;

      // Analyze the data
      const totalEvents = auditLogs.length;
      const failedEvents = auditLogs.filter(log => 
        log.new_values && 
        typeof log.new_values === 'object' && 
        'success' in log.new_values && 
        log.new_values.success === false
      ).length;
      
      const userActivity = auditLogs.reduce((acc, log) => {
        if (log.user_id) {
          acc[log.user_id] = (acc[log.user_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const actionTypes = auditLogs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        period: { start: startDate, end: endDate },
        summary: {
          totalEvents,
          failedEvents,
          successRate: ((totalEvents - failedEvents) / totalEvents * 100).toFixed(2)
        },
        topUsers: Object.entries(userActivity)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10),
        topActions: Object.entries(actionTypes)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10),
        securityAlerts: auditLogs.filter(log => 
          log.action.includes('role') || 
          log.action.includes('delete') ||
          (log.new_values && 
           typeof log.new_values === 'object' && 
           'success' in log.new_values && 
           log.new_values.success === false)
        )
      };
    } catch (error) {
      console.error('Error generating security report:', error);
      return null;
    }
  }

  // Validate session and detect session hijacking
  static async validateSession(): Promise<{ valid: boolean; reason?: string }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return { valid: false, reason: 'No valid session found' };
      }

      // Check if session is about to expire (within 5 minutes)
      const expiresAt = new Date(session.expires_at! * 1000);
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
      
      if (expiresAt < fiveMinutesFromNow) {
        // Refresh the session
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          return { valid: false, reason: 'Session refresh failed' };
        }
      }

      return { valid: true };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false, reason: 'Session validation failed' };
    }
  }

  // Secure data access wrapper
  static async secureDataAccess<T>(
    operation: () => Promise<T>,
    context: {
      action: string;
      userId?: string;
      requiresAuth?: boolean;
      rateLimitAction?: keyof typeof RATE_LIMITS;
    }
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      // Check authentication if required
      if (context.requiresAuth) {
        const sessionCheck = await this.validateSession();
        if (!sessionCheck.valid) {
          await this.logSecurityEvent(context.action, {
            userId: context.userId,
            success: false,
            errorMessage: `Authentication failed: ${sessionCheck.reason}`
          });
          return { success: false, error: 'Authentication required' };
        }
      }

      // Check rate limiting if specified
      if (context.rateLimitAction && context.userId) {
        const rateCheck = this.checkRateLimit(context.userId, context.rateLimitAction);
        if (!rateCheck.allowed) {
          await this.logSecurityEvent(context.action, {
            userId: context.userId,
            success: false,
            errorMessage: 'Rate limit exceeded'
          });
          return { success: false, error: 'Rate limit exceeded' };
        }
      }

      // Check for suspicious activity
      if (context.userId) {
        const suspiciousCheck = await this.detectSuspiciousActivity(context.userId);
        if (suspiciousCheck.isSuspicious) {
          await this.logSecurityEvent('suspicious_activity_detected', {
            userId: context.userId,
            success: false,
            errorMessage: `Suspicious activity: ${suspiciousCheck.reasons.join(', ')}`
          });
          console.warn(`Suspicious activity detected for user ${context.userId}:`, suspiciousCheck.reasons);
        }
      }

      // Execute the operation
      const data = await operation();

      // Log successful operation
      await this.logSecurityEvent(context.action, {
        userId: context.userId,
        success: true
      });

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await this.logSecurityEvent(context.action, {
        userId: context.userId,
        success: false,
        errorMessage
      });

      return { success: false, error: errorMessage };
    }
  }
}