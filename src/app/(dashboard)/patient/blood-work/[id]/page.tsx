import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDBUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, FileText } from "lucide-react";
import { BiomarkerChart } from "@/components/blood-work/biomarker-chart";
import { BiomarkerCard } from "@/components/blood-work/biomarker-card";
import {
  getBiomarkerTrend,
  getUniqueBiomarkers,
} from "@/lib/utils/biomarker-utils";
import type { BloodWork, BiomarkerValue } from "@/types/database";

interface BloodWorkDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BloodWorkDetailPage({
  params,
}: BloodWorkDetailPageProps) {
  const { id } = await params;
  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect("/login");
  }

  if (user.role !== "patient") {
    redirect(`/${user.role}`);
  }

  const supabase = await createClient();

  // Get patient record
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!patient) {
    redirect("/login");
  }

  // Get the specific blood work record
  const { data: record } = await supabase
    .from("blood_work")
    .select("*")
    .eq("id", id)
    .eq("patient_id", patient.id)
    .single();

  if (!record) {
    notFound();
  }

  // Get ALL blood work records for trend data
  const { data: allRecords } = await supabase
    .from("blood_work")
    .select("*")
    .eq("patient_id", patient.id)
    .order("date", { ascending: true });

  const bloodWorkRecords = (allRecords || []) as BloodWork[];
  const currentRecord = record as BloodWork;

  // Get unique biomarkers from current record
  const biomarkerNames = currentRecord.biomarkers
    ? Object.keys(currentRecord.biomarkers)
    : [];

  // Find previous record for trend comparison
  const currentIndex = bloodWorkRecords.findIndex((r) => r.id === id);
  const previousRecord =
    currentIndex > 0 ? bloodWorkRecords[currentIndex - 1] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={new Date(currentRecord.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
        description={`Lab: ${currentRecord.lab_source}`}
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/patient/blood-work">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          {currentRecord.pdf_url && (
            <Button variant="outline" asChild>
              <a
                href={currentRecord.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="mr-2 h-4 w-4" />
                View PDF
              </a>
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Notes Section */}
      {currentRecord.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{currentRecord.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Biomarkers Section */}
      {biomarkerNames.length > 0 ? (
        <>
          {/* Biomarker Cards Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Biomarkers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {biomarkerNames.map((name) => {
                  const biomarker = currentRecord.biomarkers![
                    name
                  ] as BiomarkerValue;
                  const previousBiomarker =
                    previousRecord?.biomarkers?.[name] as
                      | BiomarkerValue
                      | undefined;

                  return (
                    <BiomarkerCard
                      key={name}
                      name={name}
                      value={biomarker.value}
                      unit={biomarker.unit}
                      previousValue={previousBiomarker?.value}
                      referenceRange={{
                        low: biomarker.reference_low,
                        high: biomarker.reference_high,
                      }}
                      flag={biomarker.flag}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Trend Charts Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trend History</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {biomarkerNames.map((name) => {
                  const biomarker = currentRecord.biomarkers![
                    name
                  ] as BiomarkerValue;
                  const trendData = getBiomarkerTrend(bloodWorkRecords, name);

                  // Skip if no trend data (single data point is still shown)
                  if (trendData.length === 0) return null;

                  return (
                    <AccordionItem key={name} value={name}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <span>{name}</span>
                          <span className="text-sm text-muted-foreground">
                            ({trendData.length}{" "}
                            {trendData.length === 1 ? "record" : "records"})
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-4">
                          <BiomarkerChart
                            data={trendData}
                            referenceRange={{
                              low: biomarker.reference_low,
                              high: biomarker.reference_high,
                            }}
                            unit={biomarker.unit}
                            biomarkerName={name}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p>No biomarker data available for this record.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
