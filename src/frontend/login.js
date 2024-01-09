document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Implement MongoDB validation here

        // Example: Simulate successful login
        var response = await authenticate({username: username, password: password});
        if (!response.token) {
            alert("Login unsuccesful!");
        } else {
            setCookie("login", response.token, 5)
            location.reload();
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signup-form");
    signupForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = document.getElementById("signup-username").value;
        const password = document.getElementById("signup-password").value;

        var response = await authenticate({username: username, password: password});
        if (!response.token) {
            alert("Sign up unsuccesful!");
        } else {
            setCookie("login", response.token, 5)
            location.reload();
        }
    });
});

async function authenticate(obj){
  var res = await fetch("/authentication", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': navigator.userAgent,
    },
    body: JSON.stringify(obj)
  })
  var data = await res.json()
  return data
}

function setCookie(name, value, daysToExpire) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
    const cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    document.cookie = cookie;
}