const folderBtn = document.querySelector('#folderBtn');
const folderNameInput = document.querySelector('#folderNameInput');
const Uuid = document.querySelector('#Uuid');

folderBtn.onclick = () => {
    const folderToCreate = folderNameInput.value;
    fetch('http://localhost:4090/api/crfd', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({foldername: folderToCreate, uuid: Uuid.value})
    }).then((res) => {
        if (res.ok) {
            return res.json()
        } else {
            console.log(res.json());
        }
    }).then((msg) => {
        // console.log(msg);
        window.location.assign(msg.url)
    }).catch((err) => {
        console.log(err);
    })
}




