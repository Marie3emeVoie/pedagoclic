import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertWeeklyReportSchema, type WeeklyReport, type InsertWeeklyReport } from "@shared/schema";
import { z } from "zod";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { 
  User, 
  Target, 
  Heart, 
  Scissors, 
  MessageCircle, 
  Users, 
  Calendar, 
  Home, 
  ClipboardCheck, 
  MessageSquare,
  Save,
  Send
} from "lucide-react";

const formSchema = insertWeeklyReportSchema.extend({
  autonomySkills: z.object({
    dressing: z.boolean().default(false),
    washing: z.boolean().default(false),
    toilet: z.boolean().default(false),
    materials: z.boolean().default(false),
    organizing: z.boolean().default(false),
  }),
  fineMotorSkills: z.object({
    pencil: z.boolean().default(false),
    scissors: z.boolean().default(false),
    buttons: z.boolean().default(false),
    laces: z.boolean().default(false),
    shapes: z.boolean().default(false),
    writing: z.boolean().default(false),
  }),
  communicationSkills: z.object({
    needs: z.boolean().default(false),
    questions: z.boolean().default(false),
    initiate: z.boolean().default(false),
    listening: z.boolean().default(false),
    vocabulary: z.boolean().default(false),
    instructions: z.boolean().default(false),
  }),
  socialSkills: z.object({
    rules: z.boolean().default(false),
    sharing: z.boolean().default(false),
    waiting: z.boolean().default(false),
    teamwork: z.boolean().default(false),
    conflicts: z.boolean().default(false),
    interactions: z.boolean().default(false),
  }),
  dailyTracking: z.object({
    monday: z.object({
      objective: z.string().default(""),
      status: z.string().default(""),
      remark: z.string().default(""),
    }),
    tuesday: z.object({
      objective: z.string().default(""),
      status: z.string().default(""),
      remark: z.string().default(""),
    }),
    wednesday: z.object({
      objective: z.string().default(""),
      status: z.string().default(""),
      remark: z.string().default(""),
    }),
    thursday: z.object({
      objective: z.string().default(""),
      status: z.string().default(""),
      remark: z.string().default(""),
    }),
    friday: z.object({
      objective: z.string().default(""),
      status: z.string().default(""),
      remark: z.string().default(""),
    }),
  }),
});

type FormData = z.infer<typeof formSchema>;

interface WeeklyReportFormProps {
  reportId?: string;
}

export default function WeeklyReportForm({ reportId }: WeeklyReportFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingReport, isLoading: reportLoading } = useQuery<WeeklyReport>({
    queryKey: ["/api/weekly-reports", reportId],
    enabled: !!reportId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentFirstName: "",
      studentLastName: "",
      studentClass: "",
      observerName: "",
      weekStartDate: "",
      weekEndDate: "",
      autonomySkills: {
        dressing: false,
        washing: false,
        toilet: false,
        materials: false,
        organizing: false,
      },
      autonomyComment: "",
      fineMotorSkills: {
        pencil: false,
        scissors: false,
        buttons: false,
        laces: false,
        shapes: false,
        writing: false,
      },
      fineMotorComment: "",
      communicationSkills: {
        needs: false,
        questions: false,
        initiate: false,
        listening: false,
        vocabulary: false,
        instructions: false,
      },
      communicationComment: "",
      socialSkills: {
        rules: false,
        sharing: false,
        waiting: false,
        teamwork: false,
        conflicts: false,
        interactions: false,
      },
      socialComment: "",
      dailyTracking: {
        monday: { objective: "", status: "", remark: "" },
        tuesday: { objective: "", status: "", remark: "" },
        wednesday: { objective: "", status: "", remark: "" },
        thursday: { objective: "", status: "", remark: "" },
        friday: { objective: "", status: "", remark: "" },
      },
      homeObjectiveWorked: false,
      homeStatus: "",
      familyComment: "",
      finalObservation: "",
      freeComments: "",
    },
  });

  // Load existing report data
  useEffect(() => {
    if (existingReport) {
      form.reset({
        studentFirstName: existingReport.studentFirstName,
        studentLastName: existingReport.studentLastName,
        studentClass: existingReport.studentClass,
        observerName: existingReport.observerName,
        weekStartDate: existingReport.weekStartDate,
        weekEndDate: existingReport.weekEndDate,
        autonomySkills: existingReport.autonomySkills as any,
        autonomyComment: existingReport.autonomyComment || "",
        fineMotorSkills: existingReport.fineMotorSkills as any,
        fineMotorComment: existingReport.fineMotorComment || "",
        communicationSkills: existingReport.communicationSkills as any,
        communicationComment: existingReport.communicationComment || "",
        socialSkills: existingReport.socialSkills as any,
        socialComment: existingReport.socialComment || "",
        dailyTracking: existingReport.dailyTracking as any,
        homeObjectiveWorked: existingReport.homeObjectiveWorked || false,
        homeStatus: existingReport.homeStatus || "",
        familyComment: existingReport.familyComment || "",
        finalObservation: existingReport.finalObservation || "",
        freeComments: existingReport.freeComments || "",
      });
    }
  }, [existingReport, form]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/weekly-reports", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rapport créé",
        description: "Le rapport hebdomadaire a été créé avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-reports"] });
      setLocation("/");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous êtes déconnecté. Reconnexion en cours...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de créer le rapport. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("PUT", `/api/weekly-reports/${reportId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rapport mis à jour",
        description: "Le rapport hebdomadaire a été mis à jour avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-reports", reportId] });
      setLocation("/");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous êtes déconnecté. Reconnexion en cours...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rapport. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (reportId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (reportLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const dayColors = {
    monday: "text-blue-500",
    tuesday: "text-green-500", 
    wednesday: "text-yellow-500",
    thursday: "text-purple-500",
    friday: "text-red-500"
  };

  const dayNames = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi", 
    thursday: "Jeudi",
    friday: "Vendredi"
  };

  return (
    <Card className="shadow-sm border border-border">
      <CardContent className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {reportId ? "Modifier le" : "Nouveau"} Formulaire de Suivi Hebdomadaire
          </h2>
          <p className="text-muted-foreground">
            Remplissez ce formulaire pour documenter les progrès de l'élève cette semaine.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Section 1: Informations de Base */}
            <div className="p-6 bg-secondary/50 rounded-lg border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <User className="text-primary mr-2" />
                Informations de Base
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="studentFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom de l'élève</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Asma" 
                          {...field} 
                          data-testid="input-student-firstname"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'élève</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Martin" 
                          {...field} 
                          data-testid="input-student-lastname"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classe</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-student-class">
                            <SelectValue placeholder="Sélectionner une classe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cp">CP</SelectItem>
                          <SelectItem value="ce1">CE1</SelectItem>
                          <SelectItem value="ce2">CE2</SelectItem>
                          <SelectItem value="cm1">CM1</SelectItem>
                          <SelectItem value="cm2">CM2</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="observerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'observateur</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Votre nom" 
                          {...field} 
                          data-testid="input-observer-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weekStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semaine du</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          data-testid="input-week-start"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weekEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>au</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          data-testid="input-week-end"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 2: Objectifs et Compétences */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                <Target className="text-primary mr-2" />
                Objectifs et Compétences
              </h3>

              {/* Autonomie */}
              <div className="mb-6 p-5 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-foreground mb-3 flex items-center">
                  <Heart className="text-blue-600 mr-2" />
                  Autonomie
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {[
                    { key: "dressing", label: "S'habiller seul" },
                    { key: "washing", label: "Se laver seul" },
                    { key: "toilet", label: "Aller aux toilettes seul" },
                    { key: "materials", label: "Préparer son matériel" },
                    { key: "organizing", label: "Ranger ses affaires" },
                  ].map((skill) => (
                    <FormField
                      key={skill.key}
                      control={form.control}
                      name={`autonomySkills.${skill.key}` as any}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid={`checkbox-autonomy-${skill.key}`}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {skill.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormField
                  control={form.control}
                  name="autonomyComment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commentaire Autonomie</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observations sur l'autonomie..."
                          className="h-20"
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-autonomy-comment"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Motricité Fine */}
              <div className="mb-6 p-5 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-foreground mb-3 flex items-center">
                  <Scissors className="text-green-600 mr-2" />
                  Motricité Fine
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {[
                    { key: "pencil", label: "Tenir un crayon" },
                    { key: "scissors", label: "Découper avec des ciseaux" },
                    { key: "buttons", label: "Boutonner ses vêtements" },
                    { key: "laces", label: "Attacher ses lacets" },
                    { key: "shapes", label: "Dessiner des formes" },
                    { key: "writing", label: "Écrire son nom" },
                  ].map((skill) => (
                    <FormField
                      key={skill.key}
                      control={form.control}
                      name={`fineMotorSkills.${skill.key}` as any}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid={`checkbox-fine-motor-${skill.key}`}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {skill.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormField
                  control={form.control}
                  name="fineMotorComment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commentaire Motricité Fine</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observations sur la motricité fine..."
                          className="h-20"
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-fine-motor-comment"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Communication */}
              <div className="mb-6 p-5 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-foreground mb-3 flex items-center">
                  <MessageCircle className="text-purple-600 mr-2" />
                  Communication
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {[
                    { key: "needs", label: "Exprimer ses besoins" },
                    { key: "questions", label: "Répondre à des questions" },
                    { key: "initiate", label: "Initier une conversation" },
                    { key: "listening", label: "Écouter activement" },
                    { key: "vocabulary", label: "Utiliser un vocabulaire approprié" },
                    { key: "instructions", label: "Comprendre des consignes simples" },
                  ].map((skill) => (
                    <FormField
                      key={skill.key}
                      control={form.control}
                      name={`communicationSkills.${skill.key}` as any}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid={`checkbox-communication-${skill.key}`}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {skill.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormField
                  control={form.control}
                  name="communicationComment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commentaire Communication</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observations sur la communication..."
                          className="h-20"
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-communication-comment"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Vie de classe et socialisation */}
              <div className="mb-6 p-5 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-medium text-foreground mb-3 flex items-center">
                  <Users className="text-orange-600 mr-2" />
                  Vie de classe et socialisation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {[
                    { key: "rules", label: "Respecter les règles" },
                    { key: "sharing", label: "Partager avec les autres" },
                    { key: "waiting", label: "Attendre son tour" },
                    { key: "teamwork", label: "Travailler en groupe" },
                    { key: "conflicts", label: "Gérer les conflits" },
                    { key: "interactions", label: "Interagir positivement avec les pairs" },
                  ].map((skill) => (
                    <FormField
                      key={skill.key}
                      control={form.control}
                      name={`socialSkills.${skill.key}` as any}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid={`checkbox-social-${skill.key}`}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {skill.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormField
                  control={form.control}
                  name="socialComment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commentaire Vie de Classe et Socialisation</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observations sur la vie de classe..."
                          className="h-20"
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-social-comment"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 3: Suivi Hebdomadaire */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                <Calendar className="text-primary mr-2" />
                Suivi Hebdomadaire (par jour)
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {Object.entries(dayNames).map(([dayKey, dayName]) => (
                  <Card key={dayKey} className="border border-border">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-3 flex items-center">
                        <div className={`w-2 h-2 rounded-full ${dayColors[dayKey as keyof typeof dayColors]} mr-2`} />
                        {dayName}
                      </h4>
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name={`dailyTracking.${dayKey}.objective` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-muted-foreground">
                                Objectif du jour
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Objectif..."
                                  className="text-sm"
                                  {...field}
                                  data-testid={`input-daily-objective-${dayKey}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`dailyTracking.${dayKey}.status` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-muted-foreground">
                                Statut
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger 
                                    className="text-sm"
                                    data-testid={`select-daily-status-${dayKey}`}
                                  >
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="reussi">✅ Réussi</SelectItem>
                                  <SelectItem value="en_cours">🔄 En cours</SelectItem>
                                  <SelectItem value="non_atteint">❌ Non atteint</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`dailyTracking.${dayKey}.remark` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-muted-foreground">
                                Remarque
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Remarque..."
                                  className="text-sm h-16"
                                  {...field}
                                  data-testid={`textarea-daily-remark-${dayKey}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Section 4: Suivi à la maison */}
            <div className="p-6 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Home className="text-amber-600 mr-2" />
                Suivi à la maison
              </h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="homeObjectiveWorked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-home-objective"
                        />
                      </FormControl>
                      <FormLabel className="font-medium cursor-pointer">
                        Objectif retravaillé à la maison
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="homeStatus"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Statut de réalisation</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value="realise" 
                              id="realise" 
                              data-testid="radio-home-status-realise"
                            />
                            <Label htmlFor="realise" className="cursor-pointer">
                              ✅ Réalisé
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value="non_realise" 
                              id="non_realise" 
                              data-testid="radio-home-status-non-realise"
                            />
                            <Label htmlFor="non_realise" className="cursor-pointer">
                              ❌ Non réalisé
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="familyComment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commentaire Famille</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Commentaires des parents ou de la famille..."
                          className="h-24"
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-family-comment"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 5: Observation finale */}
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <ClipboardCheck className="text-slate-600 mr-2" />
                Observation finale (fin de semaine)
              </h3>
              <FormField
                control={form.control}
                name="finalObservation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Évaluation de fin de semaine</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Bilan global de la semaine, progrès observés, défis rencontrés..."
                        className="h-32"
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-final-observation"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Section 6: Zone de remarque libre */}
            <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <MessageSquare className="text-indigo-600 mr-2" />
                Zone de remarque libre ou suggestion
              </h3>
              <FormField
                control={form.control}
                name="freeComments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commentaire libre</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Suggestions, remarques supplémentaires, recommandations..."
                        className="h-32"
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-free-comments"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-center space-x-4">
              <Button 
                type="button" 
                variant="outline"
                disabled={isLoading}
                data-testid="button-cancel"
                onClick={() => setLocation("/")}
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
                data-testid="button-submit-report"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {reportId ? "Mettre à jour" : "Soumettre"} le rapport
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
