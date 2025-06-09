import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Match } from "@/types/match";

interface TeamMatchesProps {
    matches: Match[];
}

function TeamMatchesContent({ matches }: TeamMatchesProps) {
    function getStat(match: Match, statType: string): string | number | null {
        return (
            match.statistics?.[0]?.statistics?.find((s) => s.type === statType)?.value || "-"
        );
    }

    return (
        <div className="space-y-6">
            {matches.length === 0 && (
                <p className="text-center text-muted-foreground">Cargando partidos...</p>
            )}
            {matches.map((match) => (
                <Card key={match.fixture.id} className="shadow-md border border-gray-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between text-lg">
                            <span>{match.teams.home.name}</span>
                            <span className="font-mono text-xl font-bold text-primary">
                                {match.goals.home} - {match.goals.away}
                            </span>
                            <span>{match.teams.away.name}</span>
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-1">
                            {new Date(match.fixture.date).toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                            <div>
                                <span className="font-semibold">Posesión:</span>{" "}
                                {getStat(match, "Ball Possession")}
                            </div>
                            <div>
                                <span className="font-semibold">Tiros:</span>{" "}
                                {getStat(match, "Total Shots")}
                            </div>
                            <div>
                                <span className="font-semibold">Tiros a puerta:</span>{" "}
                                {getStat(match, "Shots on Goal")}
                            </div>
                            <div>
                                <span className="font-semibold">Faltas:</span>{" "}
                                {getStat(match, "Fouls")}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function TeamMatches({ matches }: TeamMatchesProps) {
    return (
        <div className="max-w-xl mx-auto font-sans py-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Partidos y Resultados de Equipos
            </h2>
            <TeamMatchesContent matches={matches} />
        </div>
    );
}
