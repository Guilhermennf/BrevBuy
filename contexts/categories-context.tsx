"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

export interface Category {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    _count?: {
        products: number;
    };
}

interface CategoriesState {
    categories: Category[];
    loading: boolean;
    error: string | null;
}

type CategoriesAction =
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "SET_CATEGORIES"; payload: Category[] }
    | { type: "ADD_CATEGORY"; payload: Category }
    | { type: "UPDATE_CATEGORY"; payload: Category }
    | { type: "DELETE_CATEGORY"; payload: string };

const initialState: CategoriesState = {
    categories: [],
    loading: false,
    error: null,
};

function categoriesReducer(
    state: CategoriesState,
    action: CategoriesAction
): CategoriesState {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload, loading: false };
        case "SET_CATEGORIES":
            return {
                ...state,
                categories: action.payload,
                loading: false,
                error: null,
            };
        case "ADD_CATEGORY":
            return {
                ...state,
                categories: [...state.categories, action.payload],
                loading: false,
                error: null,
            };
        case "UPDATE_CATEGORY":
            return {
                ...state,
                categories: state.categories.map((c) =>
                    c.id === action.payload.id ? action.payload : c
                ),
                loading: false,
                error: null,
            };
        case "DELETE_CATEGORY":
            return {
                ...state,
                categories: state.categories.filter(
                    (c) => c.id !== action.payload
                ),
                loading: false,
                error: null,
            };
        default:
            return state;
    }
}

interface CategoriesContextType {
    state: CategoriesState;
    dispatch: React.Dispatch<CategoriesAction>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(
    undefined
);

export function CategoriesProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(categoriesReducer, initialState);

    return (
        <CategoriesContext.Provider value={{ state, dispatch }}>
            {children}
        </CategoriesContext.Provider>
    );
}

export function useCategories() {
    const context = useContext(CategoriesContext);
    if (context === undefined) {
        throw new Error(
            "useCategories deve ser usado dentro de um CategoriesProvider"
        );
    }
    return context;
}
