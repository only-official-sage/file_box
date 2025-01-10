const createUser = document.querySelector('#createUser');

createUser.addEventListener('submit', (e) => {
    e.preventDefault();
    const { username, email, password } = e.target;    

    fetch('http://localhost:4090/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: username.value, email: email.value, password: password.value})
    }).then((res) => res.json()).then((msg) => {
        // console.log(msg);
        window.location.assign(msg.url)
    }).catch((err) => {
        console.log(err);
    })
})