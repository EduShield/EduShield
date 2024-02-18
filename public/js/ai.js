import { userIdToken, listUploadedFiles } from "./app.js";

const aiDataTableBody = document.querySelector('#ai-data-table-body');

aiDataTableBody.addEventListener('click', async (event) => {
    if (event.target.classList.contains('ai-data-select-btn')) {
        const fileName = event.target.getAttribute('name');
        console.log(fileName);
        const token = await userIdToken();
        const payload = {
            fileName: fileName,
            token: token
        };
        const res = await fetch('/api/ai', {
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
        aiDataTableBody.innerHTML = `
            <tr align="center" name="null">
                <td colspan="2">No Files Uploaded</td>
            </tr>`;
        return;
    }

    const element = `
        <tr align="center" name="${file.name}">
            <td>${file.name}</td>
            <td class="ai-data-btns">
                <button class="ai-data-select-btn" name="${file.name}">
                    Select
                </button>
            </td>
        </tr>`;

    aiDataTableBody.innerHTML += element;
}

function displayUploadedFiles() {
    listUploadedFiles()
        .then((files) => {
            if (files.items.length === 0) {
                aiDataTableBody.innerHTML = '';
                addFileToTable(null);
            } else {
                aiDataTableBody.innerHTML = '';
                files.items.forEach((file) => {
                    addFileToTable(file);
                });
            }
        })
        .catch((error) => {
            console.error('Error listing files: ', error);
        });
}