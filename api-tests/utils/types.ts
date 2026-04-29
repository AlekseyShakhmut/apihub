export interface SubImage {
    _id: string;
    url: string;
    localPath: string;
}

export type TestUser = {
    email: string;
    password: string;
    role: string;
    username: string;
};


export type ToDo = {
    description: string;
    title: string
};
