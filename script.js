let contacts = [];

document.getElementById("vcfInput").addEventListener("change", handleFile);
document.getElementById("deleteSelected").addEventListener("click", deleteSelected);
document.getElementById("exportCsv").addEventListener("click", exportToCsv);
document.getElementById("exportVcf").addEventListener("click", exportToVcf);
document.getElementById("selectAll").addEventListener("change", function () {
  document.querySelectorAll('input[type="checkbox"].row-check').forEach(cb => cb.checked = this.checked);
});
document.getElementById("darkModeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

function handleFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    parseVCF(e.target.result);
    renderTable();
  };
  reader.readAsText(file);
}

function parseVCF(vcfText) {
  const entries = vcfText.split("END:VCARD");
  contacts = entries.map(entry => {
    let getField = (regex) => {
      const match = entry.match(regex);
      return match ? match[1].trim() : "";
    };

    const fullName = getField(/FN:(.+)/i);
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");
    const phoneFields = [...entry.matchAll(/TEL[^:]*:(.+)/gi)].map(m => cleanPhone(m[1]));
    const email = getField(/EMAIL[^:]*:(.+)/i);
    const birthday = getField(/BDAY:(.+)/i);

    return {
      firstName,
      lastName,
      phone1: phoneFields[0] || "",
      phone2: phoneFields[1] || "",
      email,
      birthday,
      tags: ""
    };
  }).filter(c => c.firstName || c.phone1);
}

function cleanPhone(phone) {
  phone = phone.replace(/\D/g, "");
  if (!phone.startsWith("6")) phone = "6" + phone;
  return "+" + phone;
}

function renderTable() {
  const tbody = document.querySelector("#contactsTable tbody");
  tbody.innerHTML = "";

  contacts.forEach((c, i) => {
    const birthdayHtml = formatBirthday(c.birthday);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" class="row-check" data-index="${i}"></td>
      <td contenteditable="true">${c.firstName}</td>
      <td contenteditable="true">${c.lastName}</td>
      <td contenteditable="true">${c.phone1}</td>
      <td contenteditable="true">${c.phone2}</td>
      <td contenteditable="true">${c.email}</td>
      <td contenteditable="true" class="${birthdayHtml.isSoon ? 'highlight-birthday' : ''}">${birthdayHtml.text}</td>
      <td contenteditable="true">${c.tags}</td>
    `;

    [...row.children].forEach((cell, idx) => {
      if (cell.isContentEditable) {
        cell.addEventListener("input", () => {
          const fields = ["firstName", "lastName", "phone1", "phone2", "email", "birthday", "tags"];
          contacts[i][fields[idx - 1]] = cell.textContent.trim();
        });
      }
    });

    tbody.appendChild(row);
  });
}

function deleteSelected() {
  const checks = document.querySelectorAll(".row-check:checked");
  const indexesToDelete = Array.from(checks).map(cb => parseInt(cb.dataset.index));
  contacts = contacts.filter((_, i) => !indexesToDelete.includes(i));
  renderTable();
}

function exportToCsv() {
  const csv = ["First Name,Last Name,Phone 1,Phone 2,Email,Birthday,Tags"];
  contacts.forEach(c => {
    csv.push([
      c.firstName,
      c.lastName,
      c.phone1,
      c.phone2,
      c.email,
      c.birthday,
      c.tags
    ].map(v => `"${v}"`).join(","));
  });
  downloadFile(csv.join("\n"), "contacts.csv", "text/csv");
}

function exportToVcf() {
  const vcf = contacts.map(c => {
    return `BEGIN:VCARD
VERSION:3.0
FN:${c.firstName} ${c.lastName}
N:${c.lastName};${c.firstName};;;
TEL;TYPE=CELL:${c.phone1}
${c.phone2 ? `TEL;TYPE=CELL:${c.phone2}` : ""}
${c.email ? `EMAIL:${c.email}` : ""}
${c.birthday ? `BDAY:${c.birthday}` : ""}
END:VCARD`;
  }).join("\n");

  downloadFile(vcf, "contacts_cleaned.vcf", "text/vcard");
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatBirthday(dateStr) {
  if (!dateStr) return { text: "", isSoon: false };

  const today = new Date();
  const bday = new Date(dateStr);
  const nextBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());

  if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1);

  const diffDays = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));
  const isSoon = diffDays <= 30;

  return {
    text: dateStr + (isSoon ? " 🎂" : ""),
    isSoon
  };
}