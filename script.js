let contacts = [];
let profilePhotoBase64 = '';

document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);
document.getElementById('saveContact').addEventListener('click', saveContact);
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

// Capitalize input fields
['firstName', 'lastName'].forEach(id => {
  document.getElementById(id).addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\b\w/g, l => l.toUpperCase());
  });
});

// Phone formatting
['phone1', 'phone2'].forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener('input', () => input.value = formatPhone(input.value));
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
    input.value = formatPhone(pasteData);
  });
});

// Birthday picker
flatpickr("#birthday", {
  dateFormat: "d/m/Y"
});

// Save Contact
function saveContact() {
  const contact = {
    firstName: capitalizeWords(document.getElementById('firstName').value.trim()),
    lastName: capitalizeWords(document.getElementById('lastName').value.trim()),
    phone1: formatPhone(document.getElementById('phone1').value.trim()),
    phone2: formatPhone(document.getElementById('phone2').value.trim()),
    email: document.getElementById('email').value.trim(),
    birthday: document.getElementById('birthday').value.trim(),
    tags: document.getElementById('tags').value,
    photo: profilePhotoBase64
  };
  contacts.push(contact);
  renderContacts();
  clearForm();
}

function renderContacts() {
  const tbody = document.querySelector('#contactsTable tbody');
  tbody.innerHTML = '';
  contacts.forEach((c, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox" data-index="${index}"></td>
      <td>${c.firstName}</td>
      <td>${c.lastName}</td>
      <td>${c.phone1}</td>
      <td>${c.phone2}</td>
      <td>${c.email}</td>
      <td>${c.birthday}</td>
      <td>${c.tags}</td>
    `;
    tbody.appendChild(tr);
  });
}

function formatPhone(value) {
  value = value.replace(/\D/g, '');
  if (!value.startsWith('6')) value = '6' + value;
  value = '+' + value;
  if (value.length > 5) value = value.slice(0, 5) + '-' + value.slice(5);
  if (value.length > 10) value = value.slice(0, 10) + ' ' + value.slice(10);
  return value.slice(0, 15);
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

function handlePhotoUpload(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function(evt) {
    profilePhotoBase64 = evt.target.result.split(',')[1];
  };
  if (file) reader.readAsDataURL(file);
}

function toggleDarkMode() {
  document.body.toggleAttribute('data-theme');
}

function clearForm() {
  document.getElementById('contact-form')?.reset();
}

// (Add Export CSV and Export VCF later if you need)
