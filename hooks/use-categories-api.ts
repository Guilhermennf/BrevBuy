"use client";

import { useCallback } from "react";
import { useCategories, Category } from "@/contexts/categories-context";
import { toast } from "@/hooks/use-toast";

export function useCategoriesApi() {
    const { state, dispatch } = useCategories();

    const fetchCategories = useCallback(async () => {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            const response = await fetch("/api/categories");
            if (!response.ok) {
                throw new Error("Erro ao carregar categorias");
            }
            const categories = await response.json();
            dispatch({ type: "SET_CATEGORIES", payload: categories });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Erro desconhecido";
            dispatch({ type: "SET_ERROR", payload: message });
            toast({
                title: "Erro",
                description: message,
                variant: "destructive",
            });
        }
    }, [dispatch]);

    const createCategory = useCallback(
        async (data: {
            name: string;
            description?: string;
            color?: string;
            icon?: string;
        }) => {
            dispatch({ type: "SET_LOADING", payload: true });
            try {
                const response = await fetch("/api/categories", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.error || "Erro ao criar categoria"
                    );
                }

                const newCategory = await response.json();
                dispatch({ type: "ADD_CATEGORY", payload: newCategory });

                toast({
                    title: "Sucesso",
                    description: "Categoria criada com sucesso!",
                });

                return newCategory;
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Erro desconhecido";
                dispatch({ type: "SET_ERROR", payload: message });
                toast({
                    title: "Erro",
                    description: message,
                    variant: "destructive",
                });
                throw error;
            }
        },
        [dispatch]
    );

    const updateCategory = useCallback(
        async (
            id: string,
            data: {
                name: string;
                description?: string;
                color?: string;
                icon?: string;
            }
        ) => {
            dispatch({ type: "SET_LOADING", payload: true });
            try {
                const response = await fetch(`/api/categories/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.error || "Erro ao atualizar categoria"
                    );
                }

                const updatedCategory = await response.json();
                dispatch({ type: "UPDATE_CATEGORY", payload: updatedCategory });

                toast({
                    title: "Sucesso",
                    description: "Categoria atualizada com sucesso!",
                });

                return updatedCategory;
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Erro desconhecido";
                dispatch({ type: "SET_ERROR", payload: message });
                toast({
                    title: "Erro",
                    description: message,
                    variant: "destructive",
                });
                throw error;
            }
        },
        [dispatch]
    );

    const deleteCategory = useCallback(
        async (id: string) => {
            dispatch({ type: "SET_LOADING", payload: true });
            try {
                const response = await fetch(`/api/categories/${id}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.error || "Erro ao excluir categoria"
                    );
                }

                dispatch({ type: "DELETE_CATEGORY", payload: id });

                toast({
                    title: "Sucesso",
                    description: "Categoria excluída com sucesso!",
                });
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Erro desconhecido";
                dispatch({ type: "SET_ERROR", payload: message });
                toast({
                    title: "Erro",
                    description: message,
                    variant: "destructive",
                });
                throw error;
            }
        },
        [dispatch]
    );

    return {
        categories: state.categories,
        loading: state.loading,
        error: state.error,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
    };
}
