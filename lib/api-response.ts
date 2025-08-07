import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ErrorCode =
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "INTERNAL_SERVER_ERROR";

export function badRequest(message = "Dados inválidos", details?: unknown) {
    return NextResponse.json(
        { error: message, code: "BAD_REQUEST" as ErrorCode, details },
        { status: 400 }
    );
}

export function unauthorized(message = "Não autorizado") {
    return NextResponse.json(
        { error: message, code: "UNAUTHORIZED" as ErrorCode },
        { status: 401 }
    );
}

export function forbidden(
    message = "Acesso negado",
    extra?: Record<string, unknown>
) {
    return NextResponse.json(
        { error: message, code: "FORBIDDEN" as ErrorCode, ...(extra || {}) },
        { status: 403 }
    );
}

export function notFound(message = "Recurso não encontrado") {
    return NextResponse.json(
        { error: message, code: "NOT_FOUND" as ErrorCode },
        { status: 404 }
    );
}

export function conflict(message = "Conflito de dados") {
    return NextResponse.json(
        { error: message, code: "CONFLICT" as ErrorCode },
        { status: 409 }
    );
}

export function serverError(message = "Erro interno do servidor") {
    return NextResponse.json(
        { error: message, code: "INTERNAL_SERVER_ERROR" as ErrorCode },
        { status: 500 }
    );
}

export function created<T extends object>(data: T, message?: string) {
    // Para compatibilidade com o cliente, mantemos o payload original e adicionamos message
    return NextResponse.json(
        message ? { ...(data as any), message } : (data as any),
        { status: 201 }
    );
}

export function ok<T extends object | Array<unknown>>(
    data: T,
    message?: string
) {
    // Em mutations podemos enviar message junto do payload
    return NextResponse.json(
        message ? { ...(data as any), message } : (data as any)
    );
}

export function message(
    message: string,
    status = 200,
    extra?: Record<string, unknown>
) {
    return NextResponse.json({ message, ...(extra || {}) }, { status });
}

export function fromZod(error: unknown, fallbackMessage = "Dados inválidos") {
    if (error instanceof ZodError) {
        return badRequest(fallbackMessage, error.errors);
    }
    return null;
}
