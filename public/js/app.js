// app.js primary universal application file for jonapp2
// Author: Nate Sales
//
// This file provides firebase objects as well as universal user account logic, popups, and control flow.
// It should be loaded after firebase and before all other project JS files and depends on firebase.

let user; // Currently authenticated user (supervisor)
let db; // Firebase cloud firestore

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    db = firebase.firestore();

    if (!firebase.apps.length) { // If firebase is not already initalized
        firebase.initializeApp({ // Initialize firebase. (This is all client-side safe)
            apiKey: "AIzaSyDLGdqO7cCBoMWRvUD2Iy8gMVZ-bYUBGbE",
            authDomain: "jonapp-2.firebaseapp.com",
            databaseURL: "https://jonapp-2.firebaseio.com",
            projectId: "jonapp-2",
            storageBucket: "jonapp-2.appspot.com",
            messagingSenderId: "851985231577",
            appId: "1:851985231577:web:67563f2397c4d08dea18c8",
            measurementId: "G-77EKECDTF7"
        });
    }

    firebase.auth().onAuthStateChanged(_user => { // Update user global if the authentication state changes
        user = _user;
    });
});


/**
 * Trigger login popup and redirect
 * @return {Promise} login popup completion
 */
function logIn() {
    // OAuth provider
    const provider = new firebase.auth.GoogleAuthProvider();

    // Return promise of popup completion
    return firebase.auth().signInWithPopup(provider).then(result => {
        user = result.user; // Update user global

        let userDoc = db.collection("users").doc(user.uid); // The currently authenticating user's doc

        console.log("Starting login routine.");

        userDoc.get().then(function (doc) { // Get the document
            if (doc.data() && doc.data()["active"]) { // If the user exists (Is already registered in the database)
                console.log("User exists");
            } else {
                console.log("User does not exist");
            }
        });
    });
}

/**
 * Log in if not already and redirect.
 * @param url
 */
function cleanLogin(url) {
    if (user) {
        window.location = url;
    } else {
        logIn().then(() => {
            window.location = url;
        });
    }
}

/**
 * Log out current user and redirect to index
 */
function logOut() {
    firebase.auth().signOut().then(() => {
        // Redirect once the operation is complete
        window.location = "/";
    });
}

/**
 * Delete account
 * DANGER! This is irreversible and may cause orphan documents (Projects or users)
 */
function deleteAccount() {
    if (confirm('DANGER! This can leave users without a supervisor. Make sure to transfer your users to another supervisor before deleting your account. Are you sure you want to delete your account?')) {
        logOut();
        window.location = '/';
    }
}

//
// /**
//  * Create a new end user and assign current supervisor to it.
//  * @param {string} name The end user's name.
//  * @returns {Promise} db operation
//  */
// function createUser(name) {
//     return db.collection("users").add({ // Create the user
//         name: name,
//         supervisors: [user.uid], // With the current supervisor pre-authorized.
//         projects: []
//     }).then(function (docRef) {
//         db.collection("supervisors").doc(user.uid).update({
//             users: firebase.firestore.FieldValue.arrayUnion(docRef.id)
//         });
//     });
// }
//
//
// /**
//  * Authorize a supervisor for a user.
//  * @param {string} supervisor Supervisor's ID
//  * @param {string} user User's ID
//  * @returns {Promise} db operation
//  */
// function addSupervisor(supervisor, user) {
//     return db.collection("users").doc(user).update({
//         supervisors: firebase.firestore.FieldValue.arrayUnion(supervisor)
//     });
// }
//
//
// /**
//  * Remove a supervisor from a user.
//  * @param {string} supervisor Supervisor's ID
//  * @param {string} user User's ID
//  * @returns {Promise} db operation
//  */
// function removeSupervisor(supervisor, user) {
//     return db.collection("users").doc(user).update({
//         supervisors: firebase.firestore.FieldValue.arrayRemove(supervisor)
//     });
// }
//
//
// /**
//  * Get array of users
//  * @returns {array} Users //TODO
//  */
// function getUsers() {
//     firebase.auth().onAuthStateChanged(user => {
//         db.collection("supervisors").doc(user.uid).get().then(function (doc) {
//             users = doc.data()["users"];
//
//             for (i = 0; i < users.length; i++) {
//                 db.collection("users").doc(users[i]).get().then(function (doc) {
//                     console.log(doc.data());
//                 });
//             }
//         });
//     });
// }
//
//
// /**
//  * Create a new project
//  * @param {string} name Name
//  * @param {string} desc Description
//  * @param {string} image_url URL of image
//  * @returns {Promise} db operation
//  */
// function createProject(name, desc, image_url) {
//     return db.collection("projects").add({ // Create the project
//         name: name,
//         desc: desc,
//         image_url: image_url,
//         authorized_users: [user.uid], // Pre-authorize current supervisor for use in this project.
//         tasks: []
//     }).then(function (docRef) {
//         console.log("Created project " + docRef.id);
//     });
// }
