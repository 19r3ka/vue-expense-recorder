if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/vue-expense-recorder/sw.js', { scope: '/vue-expense-recorder/' })})}