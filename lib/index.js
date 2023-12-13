var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/config.ts
var TIMEZONE = "europe/zurich";

// src/dates.ts
var toYYYYMMDD = (date) => {
  return date.toLocaleString("en-GB", { timeZone: TIMEZONE }).slice(0, 10).split("/").reverse().join("-");
};
var getCurrentCalenderMonth = (offset = 0) => {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const dates = [];
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  let _dow = firstDayOfMonth.getDay();
  if (_dow === 0)
    _dow = 7;
  while (_dow > 1) {
    _dow--;
    const d = new Date(date.getFullYear(), date.getMonth(), 1 - _dow);
    dates.push({ dateTime: d, month: "prev" });
  }
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    dates.push({ dateTime: new Date(date.getFullYear(), date.getMonth(), i), month: "current" });
  }
  _dow = lastDayOfMonth.getDay();
  while (_dow < 7) {
    _dow++;
    const d = new Date(date.getFullYear(), date.getMonth() + 1, _dow - lastDayOfMonth.getDay());
    dates.push({ dateTime: d, month: "next" });
  }
  return dates;
};
var getMonthName = (month) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  return monthNames[month];
};
var getDayOfWeekName = (day) => {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return dayNames[day];
};
var isToday = (someDate, today) => {
  const t = today || new Date();
  return someDate.getDate() == t.getDate() && someDate.getMonth() == t.getMonth() && someDate.getFullYear() == t.getFullYear();
};

// src/dom.ts
var h = (tag, props, ...child) => {
  const el = document.createElement(tag);
  child.forEach((c) => {
    if (typeof c === "string")
      el.innerHTML = c;
    else if (c instanceof HTMLElement)
      el.append(c);
  });
  return el;
};
function isDescendant(desc, root) {
  return !!desc && (desc === root || isDescendant(desc.parentNode, root));
}
var onNodeRemove = (element, callback) => {
  let observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      mutation.removedNodes.forEach((removed) => {
        if (isDescendant(element, removed)) {
          callback();
          if (observer) {
            observer.disconnect();
            observer = void 0;
          }
        }
      });
    });
  });
  observer.observe(document, {
    childList: true,
    subtree: true
  });
  return observer;
};

// src/testEvents.ts
var makeTestEvents = () => {
  const now = new Date();
  const randomDate = () => {
    const m = Math.ceil(Math.random() * 3) - 2;
    const d = Math.ceil(Math.random() * 30);
    const date = new Date(now.getFullYear(), now.getMonth() + m, d);
    const h2 = Math.ceil(Math.random() * 9) * 8;
    const min = Math.floor(Math.random() * 4);
    date.setHours(h2, min * 15, 0);
    return date;
  };
  const events = [];
  for (let i = 0; i < 300; i++) {
    const event = {
      id: "random",
      start: {
        dateTime: randomDate(),
        timeZone: "Europe/Zurich"
      },
      description: "",
      summary: Math.random() > 0.98 ? "URGENCE" : Math.random() > 0.9 ? "LIBRE" : "Test Event"
    };
    events.push(event);
  }
  return events;
};

// src/index.ts
var Calendar = class {
  constructor(config) {
    this.config = config;
    this.eventHandlers = [];
  }
  onClick(handler) {
    this.eventHandlers.push(handler);
  }
  emitEvent(type, data) {
    this.eventHandlers.forEach((cb) => cb(type, data));
  }
  removeEvents() {
    this.eventHandlers.forEach((cb) => cb = null);
    this.eventHandlers = [];
  }
  getCurrentCalenderMonth(offset = 0) {
    return getCurrentCalenderMonth(offset);
  }
  addEventsToDOM(events, currentMonth) {
    return __async(this, null, function* () {
      const add = (e) => {
        return new Promise((resolve) => {
          var _a, _b;
          if (e.start.dateTime) {
            const dateTime = new Date(e.start.dateTime);
            const isCurrentMonth = dateTime.getMonth() === currentMonth.getMonth();
            const day = document.querySelector('[data-date="' + toYYYYMMDD(dateTime) + '"]');
            if (day) {
              const time = dateTime.toLocaleTimeString("en-GB", { timeZone: TIMEZONE }).slice(0, 5);
              const summary = e.summary ? e.summary.replace(/^\d{1,2}:\d{1,2}\s/gm, "") : "no title";
              const event = h("div", null, time + " " + summary);
              event.classList.add("event");
              if (!isCurrentMonth)
                event.classList.add("inactive");
              if (/libre/gim.test(summary))
                event.classList.add("free");
              if (/urgence/gim.test(summary))
                event.classList.add("urgent");
              if (/no title/gim.test(summary))
                event.classList.add("error");
              (_b = (_a = this.config) == null ? void 0 : _a.customColors) == null ? void 0 : _b.forEach((c) => {
                if (new RegExp(c.regex).test(summary)) {
                  event.style.backgroundColor = c.bg;
                  event.style.color = c.color;
                }
              });
              const filter = false;
              if (filter) {
                if (!/libre/gim.test(summary) && !/urgence/gim.test(summary))
                  event.classList.add("hidden");
              }
              event.addEventListener("click", (f) => {
                f.stopPropagation();
                this.emitEvent("event", {
                  id: e.id,
                  start: e.start,
                  time,
                  summary,
                  description: e.description || "",
                  updated: e.updated
                });
              });
              day.append(event);
            }
          }
          resolve();
        });
      };
      for (const e of events) {
        yield add(e);
      }
    });
  }
  render(offset = 0, events = []) {
    var _a;
    const c = document.getElementById("calendar");
    if (c)
      c.remove();
    const today = new Date();
    const dates = this.getCurrentCalenderMonth(offset);
    const calendar = h("div");
    calendar.id = "calendar";
    const currentMonth = (_a = dates.find((d) => d.month === "current")) == null ? void 0 : _a.dateTime;
    if (!currentMonth)
      return;
    const title = h("h3", null, getMonthName(currentMonth.getMonth()) + " " + currentMonth.getFullYear());
    const btnPrev = h("button", null, "prev");
    const btnNext = h("button", null, "next");
    btnPrev.addEventListener("click", () => {
      this.emitEvent("prev", offset - 1);
    });
    btnNext.addEventListener("click", () => {
      this.emitEvent("next", offset + 1);
    });
    const grid = h("div");
    grid.id = "grid";
    const wrapper = h("div");
    wrapper.id = "wrapper";
    for (let i = 0; i < 7; i++) {
      const spanDayOfWeek = getDayOfWeekName(i);
      const span = h("span", null, spanDayOfWeek);
      const div2 = h("div", null, span);
      div2.classList.add("box", "dayofweek");
      grid.append(div2);
    }
    for (const [i, date] of dates.entries()) {
      const span = h("span", null, date.dateTime.getDate().toString());
      span.classList.add("date");
      if (isToday(date.dateTime, today))
        span.classList.add("today");
      if (date.month !== "current")
        span.classList.add("light");
      const div2 = h("div", null, span);
      div2.classList.add("box");
      div2.setAttribute("data-date", toYYYYMMDD(date.dateTime));
      div2.addEventListener("click", (e) => {
        e.stopPropagation();
        const boxes = document.querySelectorAll("#calendar #grid .box");
        for (const box of boxes)
          box.classList.remove("selected");
        div2.classList.add("selected");
        this.emitEvent("box", toYYYYMMDD(date.dateTime));
      });
      grid.append(div2);
    }
    const div = h("div", null, btnPrev, btnNext, title);
    calendar.append(div);
    calendar.append(wrapper);
    wrapper.append(grid);
    const root = document.getElementById("calendar-root");
    if (root)
      root.append(calendar);
    else {
      alert('No element with id "calendar-root" found!');
      console.error('No element with id "calendar-root" found!');
      return;
    }
    onNodeRemove(root, () => {
      this.removeEvents();
    });
    this.addEventsToDOM(events, currentMonth);
  }
};
var example = () => __async(void 0, null, function* () {
  const events = makeTestEvents();
  const calendar = new Calendar({ customColors: [{ regex: /libre/gim, bg: "#6d6dff", color: "white" }] });
  const days = calendar.getCurrentCalenderMonth(0);
  const firstDay = days[0].dateTime;
  const lastDay = days[days.length - 1].dateTime;
  calendar.render(0, events);
  calendar.onClick((event, data) => {
    if (event === "next")
      calendar.render(data, events);
    if (event === "prev")
      calendar.render(data, events);
    if (event === "event")
      console.log(data);
    if (event === "box")
      console.log(data);
  });
});
export {
  Calendar,
  example
};
