// next.config.js (add at very top)
if (typeof global !== 'undefined' && typeof global.localStorage === 'undefined') {
    global.localStorage = {
        getItem: (k) => null,
        setItem: (k, v) => { },
        removeItem: (k) => { },
        clear: () => { },
    };
}
