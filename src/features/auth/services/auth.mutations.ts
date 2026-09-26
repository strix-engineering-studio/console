"use client";
import { useMutation } from "@tanstack/react-query";
import { authService } from "./auth.service";
export const useLogin = () => useMutation({ mutationFn: authService.login });
export const useLogout = () => useMutation({ mutationFn: authService.logout });
