import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, FileText, BarChart3 } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <GraduationCap className="text-primary text-2xl" />
              <h1 className="text-xl font-semibold text-foreground">Suivi Pédagogique</h1>
            </div>
            <Button onClick={handleLogin} data-testid="button-login">
              Se connecter
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Application de Suivi Pédagogique Hebdomadaire
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Outil destiné aux administrateurs et équipes d'observateurs pour assurer 
            le suivi individualisé d'enfants ayant des besoins éducatifs spécifiques.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="text-primary" />
                <span>Équipe Collaborative</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connexion sécurisée pour administrateurs et observateurs 
                (enseignants, AESH, éducateurs, parents).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="text-primary" />
                <span>Formulaires Complets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Évaluation détaillée des compétences : autonomie, motricité fine, 
                communication et socialisation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="text-primary" />
                <span>Suivi Hebdomadaire</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Suivi jour par jour avec objectifs, statuts et observations 
                pour un accompagnement personnalisé.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-semibold text-foreground mb-4">
            Prêt à commencer ?
          </h3>
          <p className="text-muted-foreground mb-8">
            Connectez-vous pour accéder à l'interface de suivi pédagogique.
          </p>
          <Button 
            onClick={handleLogin} 
            size="lg" 
            className="px-8 py-3"
            data-testid="button-login-main"
          >
            <GraduationCap className="mr-2" />
            Accéder à l'application
          </Button>
        </div>
      </main>
    </div>
  );
}
