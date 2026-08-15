// Redirect signed-in admins away from the login page automatically
auth.onAuthStateChanged(async (user) => {
  if (user && window.location.pathname.includes("login.html")){
    const isAdmin = await checkIsAdmin(user.uid);
    if (isAdmin) window.location.href = "dashboard.html";
  }
});

async function checkIsAdmin(uid){
  try{
    const doc = await db.collection("admins").doc(uid).get();
    return doc.exists;
  } catch(e){
    console.error(e);
    return false;
  }
}

const loginForm = document.getElementById("loginForm");
if (loginForm){
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const errEl = document.getElementById("loginError");
    const btn = document.getElementById("loginBtn");
    errEl.style.display = "none";
    btn.disabled = true;
    btn.textContent = "Signing in…";

    try{
      const cred = await auth.signInWithEmailAndPassword(email, password);
      const isAdmin = await checkIsAdmin(cred.user.uid);
      if (!isAdmin){
        await auth.signOut();
        throw new Error("This account is not authorized for the admin dashboard.");
      }
      window.location.href = "dashboard.html";
    } catch(err){
      errEl.textContent = err.message.includes("authorized")
        ? err.message
        : "Couldn't sign in — check your email and password.";
      errEl.style.display = "block";
      btn.disabled = false;
      btn.textContent = "Sign in";
    }
  });
}
