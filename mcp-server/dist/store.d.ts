export interface ContactQuery {
    id: string;
    name: string;
    email: string;
    phone?: string;
    service: string;
    budget?: string;
    message: string;
    source: string;
    createdAt: string;
}
export declare function listQueries(): Promise<ContactQuery[]>;
export declare function addQuery(input: Omit<ContactQuery, 'id' | 'createdAt'>): Promise<ContactQuery>;
//# sourceMappingURL=store.d.ts.map