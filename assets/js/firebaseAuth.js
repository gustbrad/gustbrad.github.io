const gSignIn = new firebase.auth.GoogleAuthProvider();

const signInBtn = $('#signIn');
const signOutBtn = $('#signOut');
// const appDiv = $('.app');//TODO: get div id/class uncomment: 14, 16, 38-44, 84, 66
isSignedIn();
// display();
  
function getName() {
	let niceName = sessionStorage.getItem('niceName');
	if(!sessionStorage['niceName']) {
		return 'Guest';
	}else{ return niceName }
}

function isSignedIn() {
	let signedIn = sessionStorage.getItem('userSignedIn');
	if(!sessionStorage['userSignedIn'] || signedIn === null) {
		signInBtn.show();
		signOutBtn.hide();
		return true;
	}else {
		signInBtn.hide();
		signOutBtn.show();
		return false;
	}
}

// function display() {
// 	appDiv.html($('<span>').text('Welcome '))
// 		.append($('<span>').text(getName())
// 		.append($('<span>').text('!')));	
// }

/**
 * Sign In / Out functions for google auth
 */
function signInPopup() {
	firebase.auth().useDeviceLanguage();
	firebase.auth().signInWithPopup(gSignIn)
		.then(res => {
			let {credential, user} = res;
			let token = credential.accessToken;
			signInBtn.hide();
			signOutBtn.show();
			sessionStorage.setItem('userSignedIn', true);
			sessionStorage.setItem('UID', user.uid);
			sessionStorage.setItem('user', JSON.stringify(user));
			sessionStorage.setItem('token', token);
			sessionStorage.setItem('niceName', user.displayName);
			console.log(`${user.displayName} signed in successfully!`);
			// display();
		}).catch(err => {
			let {code, message, email, credential} = err;
			console.error(`Error ${code}: ${message} ${email ? email : 'No email'} ${credential ? credential : 'No credential'}`);
		});
}

function signOut() {
	firebase.auth().signOut().then(() => {
		console.log('Sign-Out Successfull.')
		sessionStorage.setItem('userSignedIn', false);
		sessionStorage.setItem('UID', null);
		sessionStorage.setItem('user', null);
		sessionStorage.setItem('token', null);
		sessionStorage.setItem('niceName', 'Guest');
		signOutBtn.hide();
		signInBtn.show();
		// display();
	}).catch(err => console.error(err));
}

signInBtn.on('click', signInPopup);
signOutBtn.on('click', signOut);