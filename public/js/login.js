const loginUser = document.querySelector('#loginUser');

loginUser.addEventListener('submit', (e) => {
    e.preventDefault();
    const { email, password } = e.target;

    fetch('http://localhost:4090/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.value, password: password.value })
    }).then((res) => {
        if (res.ok) {
            return res.json()
        } else {
            console.log(res.json())
        }
    }).then((msg) => {
        console.log(msg);
        window.location.assign(msg.url);
    }).catch((err) => {
        console.log(err);
    })
})