function toggleForm() {
    let loginForm = document.getElementById('login-form');
    let registerForm = document.getElementById('register-form');
    let title = document.getElementById('form-title');
    let toggleText = document.getElementById('toggle-text');

    loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
    registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
    title.innerText = loginForm.style.display === 'none' ? 'Register' : 'Login';
    toggleText.innerHTML = loginForm.style.display === 'none' ? 
        "Already have an account? <span class='toggle' onclick='toggleForm()'>Login</span>" :
        "Don't have an account? <span class='toggle' onclick='toggleForm()'>Register</span>";
}

document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const nik = document.getElementById("login-nik").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nik, password })
    });

    const data = await response.json();
    if (response.ok) {
        alert("Login successful!");
        window.location.href = "dashboard.html";
    } else {
        alert(data.error || "Login failed. Please try again.");
    }
});

document.getElementById("register-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const userData = {
        nik: document.getElementById("register-nik").value,
        nama: document.getElementById("register-nama").value,
        tempatLahir: document.getElementById("register-tempatlahir").value,
        tanggalLahir: document.getElementById("register-tanggallahir").value,
        jenisKelamin: document.getElementById("register-jeniskelamin").value,
        alamat: document.getElementById("register-alamat").value,
        email: document.getElementById("register-email").value,
        password: document.getElementById("register-password").value
    };

    const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });

    const data = await response.json();
    if (response.ok) {
        alert('Registration successful! Please login.');
        toggleForm();
    } else {
        alert('Registration failed: ' + data.error);
    }
});
