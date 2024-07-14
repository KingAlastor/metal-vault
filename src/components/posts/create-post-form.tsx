"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { Dispatch, SetStateAction, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogClose,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "../ui/use-toast";

const initialFormState = {
  post_message: '',
};

const FormSchema = z.object({
  post_message: z
    .string()
    .min(10, {
      message: "Bio must be at least 10 characters.",
    })
    .max(160, {
      message: "Bio must not be longer than 30 characters.",
    }),
});

interface PostFormProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export function CreatePost() {
  const { reset, ...form } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialFormState,
  });

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const MAX_HEIGHT = 200;

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "inherit"; 
      const newHeight = Math.min(textarea.scrollHeight, MAX_HEIGHT);
      textarea.style.height = `${newHeight}px`; 
      textarea.style.overflowY = newHeight === MAX_HEIGHT ? "auto" : "hidden"; 
    }
  };

  useEffect(() => {
    adjustTextareaHeight(); 
  }, []);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const addPost = async () => {
      // await addPost(data);
      reset(initialFormState);  
    };
    addPost();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-black text-white" variant="outline">
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black text-white">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save whenre done.
          </DialogDescription>
        </DialogHeader>
        <Form reset={reset} {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >
            <div>
              <FormField
                control={form.control}
                name="post_message"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about yourself"
                        className="resize-none bg-black text-white"
                        {...field}
                        ref={textareaRef}
                        onInput={adjustTextareaHeight}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <DialogClose>
                <Button type="submit">Post</Button>
              </DialogClose>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
