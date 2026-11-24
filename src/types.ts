export type Place = {
    ID: number;
    Name: string;
    Latitude: number;
    Longitude: number;
    UserID: number;
};

export type AuthUser = {
    ID: number;
    Name: string;
    Token: string;
};

export type PlaceInput = {
    name: string;
    userId: number;
    latitude: number;
    longitude: number;
};
