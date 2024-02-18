import { userIdToken, listUploadedFiles } from "./app.js";

const visualizeDataTableBody = document.querySelector('#visualize-data-table-body');

visualizeDataTableBody.addEventListener('click', async (event) => {
    if (event.target.classList.contains('visualize-data-select-btn')) {
        const fileName = event.target.getAttribute('name');
        console.log(fileName);
        const token = await userIdToken();
        const payload = {
            fileName: fileName,
            token: token
        };
        const res = await fetch('/api/visualize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log(data);
    }
});

window.addEventListener('load', () => {
    setTimeout(() => {
        displayUploadedFiles();
    }, 2000);
});

function addFileToTable(file) {
    if (!file) {
        visualizeDataTableBody.innerHTML = `
            <tr align="center" name="null">
                <td colspan="2">No Files Uploaded</td>
            </tr>`;
        return;
    }

    const element = `
        <tr align="center" name="${file.name}">
            <td>${file.name}</td>
            <td class="visualize-data-btns">
                <button class="visualize-data-select-btn" name="${file.name}">
                    Select
                </button>
            </td>
        </tr>`;

    visualizeDataTableBody.innerHTML += element;
}

function displayUploadedFiles() {
    listUploadedFiles()
        .then((files) => {
            if (files.items.length === 0) {
                visualizeDataTableBody.innerHTML = '';
                addFileToTable(null);
            } else {
                visualizeDataTableBody.innerHTML = '';
                files.items.forEach((file) => {
                    addFileToTable(file);
                });
            }
        })
        .catch((error) => {
            console.error('Error listing files: ', error);
        });
}