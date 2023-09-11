/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { CheckCircle, Eye, EyeOff, PlusCircle, XCircle } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "./Form";
import { supabase } from "./lib/supabase";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

import "./styles/global.css";

type CreateUserData = z.infer<typeof createUserSchema>;

const createUserSchema = z
  .object({
    name: z
      .string()
      .nonempty({ message: "O nome é obrigatório" })
      .transform((name) =>
        name
          .trim()
          .split(" ")
          .map((word) => word[0].toLocaleUpperCase().concat(word.substring(1)))
          .join(" ")
      ),
    email: z
      .string()
      .nonempty({ message: "O e-mail é obrigatório" })
      .email({ message: "Formato de e-mail inválido" })
      .toLowerCase(),
    password: z
      .string()
      .nonempty({ message: "A senha é obrigatória" })
      .min(6, { message: "A senha precisa ter no mínimo 6 caracteres" }),
    confirmPassword: z
      .string()
      .min(6, "A confirmação de senha precisa ser igual a senha"),
    isVerified: z.boolean().optional(),
    techs: z
      .array(
        z.object({
          title: z
            .string()
            .nonempty({ message: "O nome da tecnologia é obrigatório" }),
        })
      )
      .min(3, { message: "Pelo menos 3 tecnologias devem ser informadas." }),
    avatar: z
      .instanceof(FileList)
      .refine((files) => !files || files.item(0), {
        message: "A imagem de perfil é obrigatória",
      })
      .refine(
        (files) => !files || (files.item(0)?.size ?? 0) <= MAX_FILE_SIZE,
        {
          message: "Tamanho máximo de 5MB",
        }
      )
      .refine(
        (files) =>
          !files || ACCEPTED_IMAGE_TYPES.includes(files.item(0)?.type ?? ""),
        {
          message: "Formato de imagem inválido",
        }
      )
      .transform((files) => files?.item(0)),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
      });
    }
  });

export function App() {
  const [output, setOutput] = useState("");
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const outputRef = useRef(null);
  const [scrollToOutput, setScrollToOutput] = useState(false);

  const createUserForm = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
  });

  async function createUser(data: CreateUserData) {
    if (data.avatar) {
      const { data: uploadData, error } = await supabase.storage
        .from("forms-react")
        .upload(`avatars/${data.avatar.name}`, data.avatar, {
          cacheControl: "3600",
          upsert: false,
        });

      console.log(uploadData);
    }

    setOutput(JSON.stringify(data, null, 2));
    setScrollToOutput(true);
  }

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
    control,
  } = createUserForm;

  const userPassword = watch("password") as string;

  const checkPasswordStrength = (password: string) => {
    const isStrong = new RegExp(
      "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
    ).test(password);

    setIsPasswordStrong(isStrong);
  };

  useEffect(() => {
    checkPasswordStrength(userPassword);
  }, [userPassword]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "techs",
  });

  function addNewTech() {
    append({ title: "" });
  }

  const isFileSelected = !!watch("avatar");

  useEffect(() => {
    if (scrollToOutput && outputRef.current) {
      setTimeout(() => {
        outputRef.current.scrollIntoView({ behavior: "smooth" });
        setScrollToOutput(false);
      }, 100);
    }
  }, [scrollToOutput]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 760);
      };
      checkIsMobile();
      window.addEventListener("resize", checkIsMobile);
      return () => {
        window.removeEventListener("resize", checkIsMobile);
      };
    }
  }, []);

  return (
    <div
      className={
        isMobile
          ? "flex flex-col items-center justify-center min-h-screen mb-[10%] mt-[10%]"
          : "min-h-[10%] flex flex-row gap-6 items-center justify-center mb-[10%] mt-[10%]"
      }
    >
      <FormProvider {...createUserForm}>
        <form
          onSubmit={handleSubmit(createUser)}
          className="flex flex-col gap-4 w-full max-w-xs"
        >
          <Form.Field>
            <div className="flex justify-center">
              <img
                src="/cadastraAiDev.png"
                alt="logo"
                className="h-240 w-240"
              ></img>
            </div>
            <Form.Label htmlFor="avatar">Imagem de Perfil</Form.Label>
            <Form.Input type="file" name="avatar" />
            <Form.ErrorMessage field="avatar" />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor="name">Nome</Form.Label>
            <Form.Input type="name" name="name" />
            <Form.ErrorMessage field="name" />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor="email">E-mail</Form.Label>
            <Form.Input type="email" name="email" />
            <Form.ErrorMessage field="email" />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor="password">
              Senha
              {userPassword && (
                <span
                  className={`font-bold text-xs ${
                    isPasswordStrong ? "text-emerald-500" : "text-red-400"
                  }`}
                >
                  {isPasswordStrong ? "Senha forte" : "Senha fraca"}
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="font-bold text-xs text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </Form.Label>
            <Form.Input
              type={showPassword ? "text" : "password"}
              name="password"
            />
            <Form.ErrorMessage field="password" />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor="confirmPassword">
              Confirmação de senha
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="font-bold text-xs text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </Form.Label>
            <Form.Input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
            />
            <Form.ErrorMessage field="confirmPassword" />
          </Form.Field>

          <Form.Field>
            <Form.Label>
              Tecnologias
              <button
                type="button"
                onClick={addNewTech}
                className="text-emerald-500 font-bold text-xs flex items-center gap-1"
              >
                Adicionar nova
                <PlusCircle size={14} />
              </button>
            </Form.Label>
            <Form.ErrorMessage field="techs" />

            {fields.map((field, index) => {
              const fieldName = `techs.${index}.title`;

              return (
                <Form.Field key={field.id}>
                  <div className="flex gap-2 items-center">
                    <Form.Input type={fieldName} name={fieldName} />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="font-bold text-red-500"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                  <Form.ErrorMessage field={fieldName} />
                </Form.Field>
              );
            })}
          </Form.Field>

          <button
            type="submit"
            disabled={isSubmitting || (errors.avatar && !isFileSelected)}
            className="bg-yellow-500 text-white rounded px-3 h-10 font-semibold text-sm hover:bg-yellow-600"
          >
            Salvar
          </button>
        </form>
      </FormProvider>

      {output && (
        <div
          ref={outputRef}
          className="flex flex-col items-center justify-center"
        >
          <CheckCircle
            className="text-yellow-400 stroke-4 stroke-current mb-4 mt-8"
            size={96}
          />

          <pre className="mb-8 font-bold text-sm bg-yellow-400 text-black-100 p-6 rounded-lg">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
