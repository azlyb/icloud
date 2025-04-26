// Select elements
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");
const contactForm = document.getElementById("contact-form");
const contactsTableBody = document.getElementById("contactsTableBody");
const selectAllCheckbox = document.getElementById("selectAll");
const deleteSelectedBtn = document.getElementById("deleteSelected");
const exportCsvBtn = document.getElementById("exportCsv");
const exportVcfBtn = document.getElementById("exportVcf");

// Storage for contacts
let contacts = [];

// Tab switching
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(button.getAttribute("data-tab")).classList.add("active");
  });
});

// Capitalize function
function capitalizeWords(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Validate Malaysian phone
function validateMalaysianPhone(phone) {
  phone = phone.replace(/\D/g, ""); // Remove non-digit
  if (phone.startsWith("01")) {
    if (phone.startsWith("011") && phone.length === 11) return true;
    if (!phone.startsWith("011") && phone.length === 10) return true;
  }
  return false;
}

// Validate email
function validateEmail(email) {
  if (!email) return true; // Not required
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
}

// Render contacts
function renderContacts() {
  contactsTableBody.innerHTML = "";

  contacts.forEach((contact, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><input type="checkbox" data-index="${index}" class="rowCheckbox"></td>
      <td>${contact.firstName}</td>
      <td>${contact.lastName}</td>
      <td>${contact.phone1}</td>
      <td>${contact.phone2}</td>
      <td>${contact.email}</td>
      <td>${contact.birthday}</td>
      <td>${contact.tags}</td>
    `;

    contactsTableBody.appendChild(row);
  });
}

// Form submit
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const firstName = capitalizeWords(document.getElementById("firstName").value.trim());
  const lastName = capitalizeWords(document.getElementById("lastName").value.trim());
  const company = capitalizeWords(document.getElementById("company").value.trim());
  const address = capitalizeWords(document.getElementById("address").value.trim());
  const phone1 = document.getElementById("phone1").value.trim();
  const phone2 = document.getElementById("phone2").value.trim();
  const email = document.getElementById("email").value.trim();
  const birthday = document.getElementById("birthday").value.trim();
  const tags = document.getElementById("tags").value;

  if (!validateMalaysianPhone(phone1)) {
    alert("Phone 1: Please enter a valid Malaysian phone number.");
    return;
  }
  if (phone2 && !validateMalaysianPhone(phone2)) {
    alert("Phone 2: Please enter a valid Malaysian phone number.");
    return;
  }
  if (!validateEmail(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  const newContact = { firstName, lastName, company, address, phone1, phone2, email, birthday, tags };

  contacts.push(newContact);
  renderContacts();

  contactForm.reset();
});

// Select all checkbox
selectAllCheckbox.addEventListener("change", (e) => {
  document.querySelectorAll(".rowCheckbox").forEach((cb) => {
    cb.checked = e.target.checked;
  });
});

// Delete selected
deleteSelectedBtn.addEventListener("click", () => {
  const selectedIndexes = Array.from(document.querySelectorAll(".rowCheckbox"))
    .filter((cb) => cb.checked)
    .map((cb) => parseInt(cb.getAttribute("data-index")));

  contacts = contacts.filter((_, idx) => !selectedIndexes.includes(idx));
  renderContacts();
});

// Export CSV
exportCsvBtn.addEventListener("click", () => {
  const csvHeader = "First Name,Last Name,Company,Address,Phone 1,Phone 2,Email,Birthday,Tags\n";
  const csvRows = contacts.map((c) => `${c.firstName},${c.lastName},${c.company},${c.address},${c.phone1},${c.phone2},${c.email},${c.birthday},${c.tags}`);
  const csvContent = csvHeader + csvRows.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "contacts.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Export VCF
exportVcfBtn.addEventListener("click", () => {
  const vcfContacts = contacts.map((c) => `
BEGIN:VCARD
VERSION:3.0
FN:${c.firstName} ${c.lastName}
N:${c.lastName};${c.firstName};;;
ORG:${c.company}
TEL;TYPE=CELL:${c.phone1}
TEL;TYPE=HOME:${c.phone2}
EMAIL:${c.email}
ADR:;;${c.address};;;;
BDAY:${formatBirthdayForVcf(c.birthday)}
CATEGORIES:${c.tags}
END:VCARD
`).join("\n");

  const blob = new Blob([vcfContacts], { type: "text/vcard;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "contacts.vcf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Helper to format birthday for VCF (DD/MM/YYYY → YYYYMMDD)
function formatBirthdayForVcf(birthday) {
  if (!birthday) return "";
  const [day, month, year] = birthday.split("/");
  return `${year}${month}${day}`;
}
