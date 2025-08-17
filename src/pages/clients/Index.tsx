import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Main App component
const App = () => {
  // State variables
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' });
  const [editingContact, setEditingContact] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Firebase initialization and authentication
  useEffect(() => {
    // Check if firebase config is available
    if (typeof __firebase_config === 'undefined') {
      showCustomModal('فشل في تهيئة فايربيز: لم يتم العثور على __firebase_config.');
      return;
    }

    try {
      // Parse firebase config
      const firebaseConfig = JSON.parse(__firebase_config);
      // Initialize firebase app
      const app = initializeApp(firebaseConfig);
      // Get Firestore and Auth instances
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);
      setDb(firestoreDb);
      setAuth(firebaseAuth);

      // Listen for auth state changes
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          // If no user, sign in with custom token or anonymously
          const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
          if (initialAuthToken) {
            await signInWithCustomToken(firebaseAuth, initialAuthToken);
          } else {
            await signInAnonymously(firebaseAuth);
          }
        }
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (error) {
      showCustomModal(`فشل في تهيئة فايربيز: ${error.message}`);
    }
  }, []);

  // Fetch contacts from Firestore
  useEffect(() => {
    // Only proceed if db, auth, and userId are ready
    if (!db || !auth || !userId || !isAuthReady) {
      return;
    }

    try {
      // Create a reference to the private contacts collection
      const contactsColRef = collection(db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${userId}/contacts`);
      
      // Listen for real-time changes
      const unsubscribe = onSnapshot(contactsColRef, (snapshot) => {
        const contactsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setContacts(contactsData);
      }, (error) => {
        showCustomModal(`فشل في جلب جهات الاتصال: ${error.message}`);
      });

      // Cleanup function to detach the listener
      return () => unsubscribe();
    } catch (error) {
      showCustomModal(`فشل في جلب جهات الاتصال: ${error.message}`);
    }
  }, [db, auth, userId, isAuthReady]);

  // Handle input changes for the new contact form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContact({ ...newContact, [name]: value });
  };

  // Handle form submission to add or update a contact
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) {
      showCustomModal('الاسم ورقم الهاتف مطلوبان.');
      return;
    }

    const trimmedName = newContact.name.trim();
    const trimmedPhone = newContact.phone.trim();
    const trimmedEmail = newContact.email.trim();

    try {
      const contactsColRef = collection(db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${userId}/contacts`);
      if (editingContact) {
        // Update existing contact
        const contactRef = doc(contactsColRef, editingContact.id);
        await updateDoc(contactRef, {
          name: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail,
        });
        showCustomModal('تم تحديث جهة الاتصال بنجاح!');
        setEditingContact(null);
      } else {
        // Add new contact
        await addDoc(contactsColRef, {
          name: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail,
          createdAt: new Date(),
        });
        showCustomModal('تم إضافة جهة الاتصال بنجاح!');
      }
      // Clear the form
      setNewContact({ name: '', phone: '', email: '' });
    } catch (error) {
      showCustomModal(`فشل في حفظ جهة الاتصال: ${error.message}`);
    }
  };

  // Set the form to edit mode with the selected contact's data
  const handleEdit = (contact) => {
    setNewContact({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
    });
    setEditingContact(contact);
  };

  // Delete a contact
  const handleDelete = async (id) => {
    try {
      const contactsColRef = collection(db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${userId}/contacts`);
      const contactRef = doc(contactsColRef, id);
      await deleteDoc(contactRef);
      showCustomModal('تم حذف جهة الاتصال بنجاح!');
    } catch (error) {
      showCustomModal(`فشل في حذف جهة الاتصال: ${error.message}`);
    }
  };

  // Show a custom modal message
  const showCustomModal = (message) => {
    setModalMessage(message);
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
      setModalMessage('');
    }, 3000);
  };

  // Render the component
  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans flex flex-col items-center">
      {/* User ID display */}
      {userId && (
        <div className="w-full max-w-2xl bg-white p-4 rounded-lg shadow-lg mb-4 text-center text-sm text-gray-600">
          معرّف المستخدم: <span className="font-mono break-all">{userId}</span>
        </div>
      )}

      {/* Main container */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">تطبيق دفتر جهات الاتصال</h1>

        {/* Form to add/edit contact */}
        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">{editingContact ? 'تعديل جهة اتصال' : 'إضافة جهة اتصال جديدة'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              name="name"
              placeholder="الاسم"
              value={newContact.name}
              onChange={handleInputChange}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            <input
              type="tel"
              name="phone"
              placeholder="رقم الهاتف"
              value={newContact.phone}
              onChange={handleInputChange}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            <input
              type="email"
              name="email"
              placeholder="البريد الإلكتروني (اختياري)"
              value={newContact.email}
              onChange={handleInputChange}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 p-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition duration-200 shadow-md"
          >
            {editingContact ? 'تحديث' : 'إضافة'}
          </button>
        </form>

        {/* Contacts list */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">جهات الاتصال</h2>
          {contacts.length === 0 ? (
            <p className="text-center text-gray-500">لا توجد جهات اتصال بعد. قم بإضافة واحدة!</p>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between transition-transform transform hover:scale-[1.01]">
                  <div className="mb-2 sm:mb-0">
                    <p className="font-bold text-gray-800 text-lg">{contact.name}</p>
                    <p className="text-gray-600">الهاتف: {contact.phone}</p>
                    {contact.email && <p className="text-gray-600">البريد الإلكتروني: {contact.email}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl text-center">
            <p className="text-lg font-semibold">{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
