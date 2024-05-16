"use strict";

let habbits = [];
const HABBIT_KEY = "HABBIT_KEY";
let globalActiveHabbitId;

// page
const page = {
  menu: document.querySelector(".menu__list"),
  header: {
    h1: document.querySelector(".header__title"),
    progressPercent: document.querySelector(".progress__percent"),
    progressCoverBar: document.querySelector(".progress__cover-bar"),
  },
  content: {
    daysContainer: document.getElementById("days"),
    nextDay: document.querySelector(".habbit__day"),
  },
  popup: {
    index: document.getElementById("add-habbit-popup"),
    iconField: document.querySelector('.popup__form input[name="icon"]'),
    form: document.querySelector(".popup__form"),
  },
  form: document.getElementById("add-day-form"), // форма для добавления комментария
};

/* utils */

function loadData() {
  const habbitString = localStorage.getItem(HABBIT_KEY);
  const habbitArray = JSON.parse(habbitString);
  if (Array.isArray(habbitArray)) {
    habbits = habbitArray;
  }
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function togglePopup() {
  if (page.popup.index.classList.contains("cover_hidden")) {
    page.popup.index.classList.remove("cover_hidden");
  } else {
    page.popup.index.classList.add("cover_hidden");
  }
}

function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = "";
  }
}

function validateForm(form, fields) {
  const formData = new FormData(form);
  const res = {};
  for (const field of fields) {
    const fieldValue = formData.get(field);
    form[field].classList.remove("error");
    if (!fieldValue) {
      form[field].classList.add("error");
    }
    res[field] = fieldValue;
  }
  let isValid = true;
  for (const field of fields) {
    if (!res[field]) {
      isValid = false;
    }
  }
  if (!isValid) {
    return;
  }
  return res;
}

// render
function rerenderMenu(activeHabbit) {
  page.menu.innerHTML = ""; // Clear the menu before rerendering
  for (const habbit of habbits) {
    const element = document.createElement("button");
    element.setAttribute("menu-habbit-id", habbit.id);
    element.addEventListener("click", () => {
      rerender(habbit.id);
    });
    element.classList.add("menu__item");
    element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}" />`;
    if (habbit.id === activeHabbit.id) {
      element.classList.add("menu__item_active");
    }
    page.menu.appendChild(element);
  }
}

function rerenderHead(activeHabbit) {
  page.header.h1.innerText = activeHabbit.name;
  const progress =
    activeHabbit.days.length / activeHabbit.target > 1
      ? 100
      : (activeHabbit.days.length / activeHabbit.target) * 100;
  page.header.progressPercent.innerText = progress.toFixed(0) + "%";
  page.header.progressCoverBar.setAttribute("style", `width: ${progress}%`);
}

function rerenderContent(activeHabbit) {
  page.content.daysContainer.innerHTML = "";
  for (let i = 0; i < activeHabbit.days.length; i++) {
    const element = document.createElement("div");
    element.classList.add("habbit");
    element.innerHTML = `
    <div class="habbit__day">День ${i + 1}</div>
    <div class="habbit__comment">${activeHabbit.days[i].comment}</div>
    <button class="habbit__delete" onclick="deleteDay(${i})">
      <img src="./images/delete.svg" alt="удалить привычку" />
    </button>`;
    page.content.daysContainer.appendChild(element);
  }
  page.content.nextDay.innerText = `День ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
  globalActiveHabbitId = activeHabbitId;
  const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId);

  if (!activeHabbit) {
    return;
  }
  rerenderMenu(activeHabbit);
  rerenderHead(activeHabbit);
  rerenderContent(activeHabbit);
}

// work with days
function addDays(event) {
  event.preventDefault();
  const data = validateForm(event.target, ["comment"]);
  if (!data) {
    return;
  }
  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{ comment: data.comment }]),
      };
    }
    return habbit;
  });
  resetForm(event.target, ["comment"]);
  rerender(globalActiveHabbitId);
  saveData();
}

function deleteDay(index) {
  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      habbit.days.splice(index, 1);
      return {
        ...habbit,
        days: habbit.days,
      };
    }
    return habbit;
  });
  rerender(globalActiveHabbitId);
  saveData();
}

// work with habbits
function setIcon(context, icon) {
  page.popup.iconField.value = icon;
  const activeIcon = document.querySelector(".icon.icon_active");
  if (activeIcon) {
    activeIcon.classList.remove("icon_active");
  }
  context.classList.add("icon_active");
}

function addHabbit(event) {
  event.preventDefault();
  const data = validateForm(event.target, ["name", "icon", "target"]);
  if (!data) {
    return;
  }
  const newHabbit = {
    id: Date.now(), // simple unique id
    name: data.name,
    target: parseInt(data.target, 10),
    icon: data.icon,
    days: [],
  };
  habbits.push(newHabbit);
  resetForm(event.target, ["name", "target"]);
  togglePopup();
  saveData();
  rerender(newHabbit.id);
}

// init
(() => {
  loadData();
  if (habbits.length > 0) {
    rerender(habbits[0].id);
  }
})();
