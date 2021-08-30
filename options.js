const saveOptions = async (e) => {
  e.preventDefault();

  const containersPolicies = (
    await browser.storage.sync.get("containersPolicies")
  ).containersPolicies;
  console.log(containersPolicies);

  const newPolicy = {
    from: document.querySelector("#timeFrom").value,
    to: document.querySelector("#timeTo").value,
    containerId: document.querySelector("#containerSelectForm").value,
    containerName: document.querySelector("#containerSelectForm").options[
      document.querySelector("#containerSelectForm").selectedIndex
    ].innerText,
  };

  browser.storage.sync
    .set({
      containersPolicies: [...(containersPolicies ?? []), newPolicy],
    })
    .then(() => fillTable());
};

const restoreOptions = async () => {
  document.querySelector("#containerSelect").value =
    (await browser.storage.sync.get("defaultContainer")).defaultContainer ??
    (await browser.contextualIdentities.query({}))[0].cookieStoreId;
};

const fillSelectWithContainers = (containers) => {
  const selectEl = [
    document.getElementById("containerSelect"),
    document.getElementById("containerSelectForm"),
  ];

  containers.forEach((container) => {
    if(container.name === "Facebook") return;

    const optionEl = document.createElement("option");
    optionEl.innerText = container.name;
    optionEl.value = container.cookieStoreId;

    selectEl.forEach((el) => el.appendChild(optionEl.cloneNode(true)));
  });
};

const fillTable = async () => {
  const containersPolicies = (
    await browser.storage.sync.get("containersPolicies")
  )?.containersPolicies;

  const tableEl = document.getElementById("tableBody");

  const newTableEl = tableEl.cloneNode(false);
  containersPolicies?.forEach((policy) => {
    const trEl = document.createElement("tr");
    const fromEl = document.createElement("td");
    fromEl.innerText = policy.from;
    trEl.appendChild(fromEl);
    const toEl = document.createElement("td");
    toEl.innerText = policy.to;
    trEl.appendChild(toEl);
    const nameEl = document.createElement("td");
    nameEl.innerText = policy.containerName;
    trEl.appendChild(nameEl);

    newTableEl.appendChild(trEl);
  });

  tableEl.parentNode.replaceChild(newTableEl, tableEl);
};

const clearPolicies = () => {
  if (window.confirm("Are you sure?"))
    browser.storage.sync
      .set({
        containersPolicies: [],
      })
      .then(() => fillTable());
};

const changeDefualtPolicy = (newValue) => {
  browser.storage.sync.set({
    defaultContainer: newValue,
  });
};

document.getElementById("clearAll").addEventListener("click", clearPolicies);
document
  .getElementById("containerSelect")
  .addEventListener("change", (e) => changeDefualtPolicy(e.target.value));
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
browser.contextualIdentities.query({}).then(fillSelectWithContainers);
fillTable();
