import {create} from 'zustand';

interface UserState {
    userName: string;
    userEmail: string;
    setUserName: (name: string) => void;
    setUserEmail: (email: string) => void;
}

const useUserStore = create<UserState>((set) => ({
    userName: '',
    userEmail: '',
    setUserName: (name) => set({ userName: name }),
    setUserEmail: (email) => set({ userEmail: email }),
}));

export default useUserStore;
