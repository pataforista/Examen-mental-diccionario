import { state as data } from './state.js';
import { utils } from './utils.js';
import { theme } from './theme.js';
import { integrator } from './integrator.js';
import { game } from './game.js';
import { donation } from './donation.js';
import { pwa } from './pwa.js';
import { dictionary } from './dictionary.js';

const App = {
    data,
    utils,
    theme,
    integrator,
    game,
    donation,
    pwa,
    ...dictionary
};

window.App = App;

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
