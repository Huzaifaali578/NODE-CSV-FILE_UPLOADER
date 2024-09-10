const form = document.getElementById("csvUploadForm");
const uploadedFilesList = document.getElementById("uploadedFilesList");

// handle thw upload file form
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById("csvFileInput");
    const file = fileInput.files[0];

    if (file) {
        // Create a new FormData object
        const formData = new FormData();
        formData.append("csvFile", file);

        try {
            // Send the POST request along with the uploaded data
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                console.log("File uploaded successfully");
                // alert("File uploaded successfully");  // Show an alert after successful upload
                fileInput.value = "";  // Clear the file input after successful upload
                fetchUploadedFiles();  // Call function to fetch the uploaded files (if this is implemented)
            } else {
                console.log("Error in uploading file");
                alert("Error in uploading file");  // Show an alert if there's an error
            }

        } catch (err) {
            console.log(`Error uploading file: ${err}`);
        }
    } else {
        console.log("No file selected for upload");
    }
});


async function fetchUploadedFiles() {
    try {
        const response = await fetch('/home', { method: 'GET' });
        const files = await response.json();

        if (files.length === 0) {
            // if no file exists, hide the file list header
            document.getElementById("upload-section").style.display = 'none';
            return;
        }

        console.log(`Files fetched: ${files}`);
        document.getElementById("upload-section").style.display = 'block';

        const uploadedFilesList = document.getElementById("uploadedFilesList");  // Make sure this element exists in your HTML
        uploadedFilesList.innerHTML = '';  // Clear the list before rendering new data

        // Render the list of files
        files.forEach(file => {
            const row = document.createElement("tr");

            // File name cell
            const filenameCell = document.createElement("td");
            filenameCell.textContent = file.filename;

            // Action buttons cell
            const actionCell = document.createElement('td');

            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('btn', 'btn-outline-danger', 'btn-sm', 'me-2');
            deleteButton.addEventListener("click", () => deleteFile(file._id));

            // View button
            const viewButton = document.createElement("button");
            viewButton.textContent = "View";
            viewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
            viewButton.addEventListener("click", () => viewFile(file._id));

            // Append buttons to the action cell
            actionCell.appendChild(deleteButton);
            actionCell.appendChild(viewButton);

            // Append cells to the row
            row.appendChild(filenameCell);
            row.appendChild(actionCell);

            // Append the row to the table
            uploadedFilesList.appendChild(row);
        });
    } catch (err) {
        console.error(`Error fetching uploaded files: ${err}`);
    }
}


// handle the deletion of file.
async function deleteFile(fileId) {
    try {
        console.log(`Deleting file with ID: ${fileId}`);
        confirm("Are you sure you want to delete this file?")
        const response = await fetch('/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileId })
        });

        if (response.ok) {
            console.log('File deleted successfully');
            // Fetch and refresh the list of uploaded files
            fetchUploadedFiles();
        } else {
            console.log('Failed to delete file');
        }
    } catch (err) {
        console.log(`Error deleting file: ${err}`);
    }
}


//send request to view a particular file, along with the file-id in req.query
function viewFile(fileId) {
    const url = `view/?id=${fileId}`;
    window.open(url);
    console.log(`Opening file with id: ${fileId}`);
};

fetchUploadedFiles();

