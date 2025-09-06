import { atom } from "jotai";
export const writeReviewShownAtom = atom(false);
export const editNameAtom = atom(false);
export const showBanTableAtom = atom(false);
export const banUserAtom = atom<string | null>(null);
