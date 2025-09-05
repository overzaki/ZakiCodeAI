// @mui
import {arSA, enUS} from '@mui/material/locale';
import {ar, enUS as en} from 'date-fns/locale';

// PLEASE REMOVE `LOCAL STORAGE` WHEN YOU CHANGE SETTINGS.
// ----------------------------------------------------------------------

export const allLangs = [
    {
        label: 'English',
        shortLabel: 'ENG',
        value: 'en',
        systemValue: enUS,
        backendValue: en,
        icon: 'flagpack:gb-nir',
    },
    {
        label: 'العربية',
        shortLabel: 'عربي',
        value: 'ar',
        systemValue: arSA,
        backendValue: ar,
        icon: 'flagpack:sa',
    },
    /*{
        label: 'Türkçe',
        value: 'tr',
        systemValue: trTR,
        backendValue: tr,
        icon: 'flagpack:tr',
    },
    {
        label: 'española',
        value: 'es',
        systemValue: esES,
        backendValue: es,
        icon: 'flagpack:es',
    },
    {
        label: 'deutsche',
        value: 'de',
        systemValue: deDE,
        backendValue: de,
        icon: 'flagpack:de',
    },
    {
        label: 'française',
        value: 'fr',
        systemValue: frFR,
        backendValue: fr,
        icon: 'flagpack:fr',
    },*/
];

export const appLocales = allLangs.map((item) => item.value); // [en, ar, tr, ....]

export const defaultLang = allLangs[0]; // English

// GET MORE COUNTRY FLAGS
// https://icon-sets.iconify.design/flagpack/
// https://www.dropbox.com/sh/nec1vwswr9lqbh9/AAB9ufC8iccxvtWi3rzZvndLa?dl=0
