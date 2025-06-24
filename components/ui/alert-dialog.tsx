"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function AlertDialog({
    open,
    onOpenChange,
    children,
}: AlertDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children}
        </Dialog>
    );
}

export function AlertDialogTrigger({
    children,
    ...props
}: {
    children: React.ReactNode;
}) {
    return <div {...props}>{children}</div>;
}

export function AlertDialogContent({
    children,
    className,
    ...props
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <DialogContent className={className} {...props}>
            {children}
        </DialogContent>
    );
}

export function AlertDialogHeader({
    children,
    className,
    ...props
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <DialogHeader className={className} {...props}>
            {children}
        </DialogHeader>
    );
}

export function AlertDialogTitle({
    children,
    className,
    ...props
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <DialogTitle className={className} {...props}>
            {children}
        </DialogTitle>
    );
}

export function AlertDialogDescription({
    children,
    className,
    ...props
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <DialogDescription className={className} {...props}>
            {children}
        </DialogDescription>
    );
}

export function AlertDialogFooter({
    children,
    className,
    ...props
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <DialogFooter className={className} {...props}>
            {children}
        </DialogFooter>
    );
}

interface AlertDialogActionProps {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
}

export function AlertDialogAction({
    children,
    onClick,
    className,
}: AlertDialogActionProps) {
    return (
        <Button onClick={onClick} className={className}>
            {children}
        </Button>
    );
}

interface AlertDialogCancelProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export function AlertDialogCancel({
    children,
    onClick,
    className,
}: AlertDialogCancelProps) {
    return (
        <Button variant="outline" onClick={onClick} className={className}>
            {children}
        </Button>
    );
}
