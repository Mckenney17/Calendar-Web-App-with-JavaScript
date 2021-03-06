/* eslint-disable prefer-const */
const monthCalController = (() => {
    const d = new Date();
    const calenderInfo = ({ nextOrPrev = 0 }) => {
        d.setMonth(d.getMonth() + nextOrPrev);

        const drefFrom = new Date(d.getFullYear(), d.getMonth());
        const drefTo = new Date(d.getFullYear(), d.getMonth() + 1);

        const monthYear = d.toLocaleDateString('en-GB', {
            month: 'long',
            year: 'numeric',
        });
        const daysInMonth = (drefTo - drefFrom) / 1000 / 60 / 60 / 24;
        const weekStart = drefFrom.getDay();
        const weekEnd = 7 - drefTo.getDay();
        const currD = new Date();
        const currDate = currD.getDate();
        const currWeek = currD.getDay();
        const currMonthYear = currD.toLocaleDateString('en-GB', {
            month: 'long',
            year: 'numeric',
        });
        const currTime = currD.toLocaleTimeString();


        return {
            monthYear, daysInMonth, weekStart, weekEnd, currDate, currWeek, currMonthYear, currTime,
        };
    };

    return {
        currentMonthCal: () => calenderInfo({}),

        navigate: ({ nextOrPrev }) => (nextOrPrev === 'next' ? calenderInfo({ nextOrPrev: 1 }) : calenderInfo({ nextOrPrev: -1 })),
    };
})();

const monthUIController = (() => {
    const DOMStrings = {
        datesCont: '.dates-grid',
        nextMonthBtn: '#next-month',
        prevMonthBtn: '#prev-month',
        currTime: '#curr-time',
        monthCalendar: '.month-calendar',
        monthYear: '.month-year',
    };

    const selector = (elem) => document.querySelector(elem);

    const classAction = (el, action, classValue) => {
        selector(el).classList[action](classValue);
    };

    const insertHtml = (elem, where, html) => {
        selector(elem).insertAdjacentHTML(where, html);
    };

    const htmlEmpty = '<span class="empty"></span>';

    const offset = (elem, week, count, num) => {
        if (week === num) return;
        insertHtml(elem, 'beforeend', htmlEmpty);
        count++;
        if (count === week) return;
        offset(elem, week, count, num);
    };

    const setProp = (elem, prop, value) => {
        if (!selector(elem)) return;
        selector(elem)[prop] = value;
    };


    return {
        monthCalendar({
            monthYear, daysInMonth, weekStart, weekEnd, currDate, currWeek, currMonthYear, currTime,
        }) {
            const [fh, sh] = monthYear.split(' ');
            const [shfh, shsh] = [sh.slice(0, 2), sh.slice(2, sh.length)];
            insertHtml(DOMStrings.nextMonthBtn, 'beforebegin', `<div class="month-year">${fh} ${shfh}<span id='relv'>${shsh}</span></div>`);

            let dateCount = 1;
            let countOffsetStart = 0;
            let countOffsetEnd = 0;
            const noOffsetStart = 0;
            const noOffsetEnd = 0;

            const offsetStart = offset;
            offsetStart(DOMStrings.datesCont, weekStart, countOffsetStart, noOffsetStart);

            const supplyDates = (count, compareTo, elem) => {
                insertHtml(elem, 'beforeend', `<span class="mdate" id="mdate-${count}">${count}</span>`);
                count++;
                if (count > compareTo) return;
                supplyDates(count, compareTo, elem);
            };
            supplyDates(dateCount, daysInMonth, DOMStrings.datesCont);

            const offsetEnd = offset;
            offsetEnd(DOMStrings.datesCont, weekEnd, countOffsetEnd, noOffsetEnd);

            if (currMonthYear === monthYear) {
                classAction(`#mdate-${currDate}`, 'add', 'curr-mdate');
                classAction(`#mwday-${currWeek}`, 'add', 'curr-mwday');
                insertHtml(`#mdate-${currDate}`, 'beforeend', `<span id='curr-time'>${currTime}</span>`);
                setInterval(() => {
                    setProp(DOMStrings.currTime, 'textContent', new Date().toLocaleTimeString());
                }, 1000);
            } else {
                classAction(`#mdate-${currDate}`, 'remove', 'curr-mdate');
                classAction(`#mwday-${currWeek}`, 'remove', 'curr-mwday');
            }
        },

        navigate({
            monthYear, daysInMonth, weekStart, weekEnd, currDate, currWeek, currMonthYear, currTime,
        }) {
            setProp(DOMStrings.monthYear, 'outerHTML', '');
            setProp(DOMStrings.datesCont, 'innerHTML', '');
            this.monthCalendar({
                monthYear, daysInMonth, weekStart, weekEnd, currDate, currWeek, currMonthYear, currTime,
            });
        },

        getDOMStrings: () => DOMStrings,
        getSelector: (elem) => selector(elem),
    };
})();

const monthAppController = ((mcCtrl, UICtrl) => {
    const DOM = UICtrl.getDOMStrings();
    const select = (elem) => UICtrl.getSelector(elem);
    const event = (elem, ev, value) => select(elem).addEventListener(ev, value);
    const setupEventListeners = () => {
        event(DOM.nextMonthBtn, 'click', navigate);
        event(DOM.prevMonthBtn, 'click', navigate);
        document.addEventListener('keydown', navigate);
    };

    const navigate = (ev) => {
        if (ev.type === 'click') {
            if (ev.target.id === 'prev-month' && `${select(DOM.monthYear).innerHTML}`.includes('January') && `${select(DOM.monthYear).innerHTML}`.includes('19') && `${select(DOM.monthYear).innerHTML}`.includes('70')) return;
            // eslint-disable-next-line no-unused-expressions
            (ev.target.id === 'next-month'
            ? UICtrl.navigate(mcCtrl.navigate({ nextOrPrev: 'next' }))
            : UICtrl.navigate(mcCtrl.navigate({ nextOrPrev: 'prev' })));
        } else if (ev.type === 'keydown') {
            if (select(DOM.monthCalendar).style.display === 'none') return;
            if (ev.keyCode === 37 && `${select(DOM.monthYear).innerHTML}`.includes('January') && `${select(DOM.monthYear).innerHTML}`.includes('19') && `${select(DOM.monthYear).innerHTML}`.includes('70')) return;
            // eslint-disable-next-line no-unused-expressions
            (ev.keyCode === 39
            ? UICtrl.navigate(mcCtrl.navigate({ nextOrPrev: 'next' }))
            : (ev.keyCode === 37 && UICtrl.navigate(mcCtrl.navigate({ nextOrPrev: 'prev' }))));
        }
    };

    return {
        init() {
            UICtrl.monthCalendar(mcCtrl.currentMonthCal());
            setupEventListeners();
        },
    };
})(monthCalController, monthUIController);
monthAppController.init();
