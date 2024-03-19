export interface Country {
    flags:     Flags;
    name:      Name;
    cca3:      string;
    capital:   string[];
    languages: { [key: string]: string };
    area:      number;
}

export interface Flags {
    png: string;
    svg?: string;
    alt?: string;
}

export interface Name {
    common:     string;
    official?:   string;
    nativeName?: { [key: string]: NativeName };
}

export interface NativeName {
    official: string;
    common:   string;
}