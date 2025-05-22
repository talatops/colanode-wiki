import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';

import { Button } from '@/renderer/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/renderer/components/ui/form';
import { Input } from '@/renderer/components/ui/input';
import { Spinner } from '@/renderer/components/ui/spinner';
import { useMutation } from '@/renderer/hooks/use-mutation';
import { toast } from '@/renderer/hooks/use-toast';
import { Server } from '@/shared/types/servers';
import { useCountdown } from '@/renderer/hooks/use-countdown';

const formSchema = z
  .object({
    otp: z.string().min(6, 'OTP must be 6 characters long'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // path of error
  });

interface EmailPasswordResetCompleteProps {
  server: Server;
  id: string;
  expiresAt: Date;
}

export const EmailPasswordResetComplete = ({
  server,
  id,
  expiresAt,
}: EmailPasswordResetCompleteProps) => {
  const { mutate, isPending } = useMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [remainingSeconds, formattedTime] = useCountdown(expiresAt);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (remainingSeconds <= 0) {
      toast({
        title: 'Code has expired',
        description: 'Please request a new code',
        variant: 'destructive',
      });
      return;
    }

    mutate({
      input: {
        type: 'email_password_reset_complete',
        otp: values.otp,
        password: values.password,
        server: server.domain,
        id: id,
      },
      onSuccess() {
        setShowSuccess(true);
      },
      onError(error) {
        toast({
          title: 'Failed to reset password',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center border border-border rounded-md p-4 gap-3 text-center">
        <CheckCircle className="size-7 text-green-600" />
        <p className="text-sm text-muted-foreground">
          Your password has been reset. You can now login with your new
          password.
        </p>
        <p className="text-sm font-semibold text-muted-foreground">
          You have been logged out of all devices.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="password" placeholder="New Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Code" {...field} />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground w-full text-center">
                {formattedTime}
              </p>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <Spinner className="mr-2 size-4" />
          ) : (
            <Lock className="mr-2 size-4" />
          )}
          Reset password
        </Button>
      </form>
    </Form>
  );
};
