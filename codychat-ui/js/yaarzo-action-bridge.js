(function () {
    'use strict';

    var allowedOrigins = [
        'https://yaarzo.com',
        'https://www.yaarzo.com'
        ,'http://localhost:8080'
    ];

    function isAllowedOrigin(origin) {
        return allowedOrigins.indexOf(origin) !== -1;
    }

    function runYaarzoAction(action) {
        switch (action) {
            case 'private':
                if (typeof window.getPrivate === 'function') {
                    window.getPrivate();
                }
                break;

            case 'friends':
                if (typeof window.friendRequest === 'function') {
                    window.friendRequest();
                }
                break;

            case 'notifications':
                if (typeof window.getNotification === 'function') {
                    window.getNotification();
                }
                break;

            case 'profile':
                var profileTrigger = document.getElementById('main_mob_menu');
                if (profileTrigger) {
                    profileTrigger.click();
                }
                break;
        }
    }

    window.addEventListener('message', function (event) {
        if (!isAllowedOrigin(event.origin)) {
            return;
        }

        if (!event.data || typeof event.data !== 'object') {
            return;
        }

        if (event.data.type !== 'YAARZO_CODY_ACTION') {
            return;
        }

        var allowedActions = [
            'private',
            'friends',
            'notifications',
            'profile'
        ];

        if (allowedActions.indexOf(event.data.action) === -1) {
            return;
        }

        runYaarzoAction(event.data.action);
    });
})();
