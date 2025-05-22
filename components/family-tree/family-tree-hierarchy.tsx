"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronRight,
  UserIcon as Male,
  UserIcon as Female,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  fullName: string;
  generation: number;
  birthYear?: string;
  birthDate?: string;
  deathDate?: string;
  isAlive?: boolean;
  gender?: string;
  image?: string;
  occupation?: string;
  parentId?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  spouseName?: string;
  childrenIds?: string[];
}

interface GenerationGroup {
  generation: number;
  members: Member[];
}

interface FamilyTreeHierarchyProps {
  familyTreeId: string;
}

export function FamilyTreeHierarchy({
  familyTreeId,
}: FamilyTreeHierarchyProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [generations, setGenerations] = useState<GenerationGroup[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/family-trees/${familyTreeId}/members/hierarchy`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch family tree hierarchy");
        }

        const data: Member[] = await response.json();
        setMembers(data);

        // Group members by generation
        const groupedByGeneration: Record<number, Member[]> = {};
        data.forEach((member) => {
          const gen = member.generation || 1;
          if (!groupedByGeneration[gen]) {
            groupedByGeneration[gen] = [];
          }
          groupedByGeneration[gen].push(member);
        });

        // Convert to array and sort by generation
        const generationGroups: GenerationGroup[] = Object.entries(
          groupedByGeneration
        )
          .map(([gen, members]) => ({
            generation: Number.parseInt(gen),
            members: members.sort((a, b) => {
              // Sort by gender (male first)
              if (a.gender !== b.gender) {
                return a.gender === "MALE" ? -1 : 1;
              }
              // If same gender, sort by name
              return a.fullName.localeCompare(b.fullName);
            }),
          }))
          .sort((a, b) => a.generation - b.generation);

        setGenerations(generationGroups);
      } catch (error) {
        console.error("Error fetching members:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu gia phả",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [familyTreeId, toast]);

  const renderMemberCard = (member: Member) => {
    const birthYear = member.birthDate
      ? new Date(member.birthDate).getFullYear()
      : member.birthYear;
    const deathYear = member.deathDate
      ? new Date(member.deathDate).getFullYear()
      : member.isAlive === false
      ? "?"
      : undefined;
    const lifespan = birthYear
      ? deathYear
        ? `${birthYear} - ${deathYear}`
        : `${birthYear} - `
      : "";

    return (
      <div className="flex items-center gap-3 bg-card hover:shadow-sm p-3 border rounded-lg transition-shadow">
        <div className="relative flex-shrink-0 border-2 border-primary rounded-full w-12 h-12 overflow-hidden">
          <Image
            src={member.image || `/placeholder.svg?height=48&width=48`}
            alt={member.fullName}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{member.fullName}</span>
            {member.gender === "MALE" ? (
              <Male className="w-4 h-4 text-blue-500" />
            ) : member.gender === "FEMALE" ? (
              <Female className="w-4 h-4 text-pink-500" />
            ) : null}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Badge variant="outline" className="px-1 py-0 text-xs">
              Đời {member.generation}
            </Badge>
            {lifespan && <span>{lifespan}</span>}
            {member.occupation && <span>• {member.occupation}</span>}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-full h-[200px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {generations.map((group) => (
        <Card
          key={group.generation}
          className="border-l-4 overflow-hidden"
          style={{ borderLeftColor: getGenerationColor(group.generation) }}
        >
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <span
                className="inline-block rounded-full w-6 h-6"
                style={{
                  backgroundColor: getGenerationColor(group.generation),
                }}
              ></span>
              Đời thứ {group.generation}
              <Badge variant="secondary">
                {group.members.length} thành viên
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {group.members.map((member) => (
                <Link
                  key={member.id}
                  href={`/dashboard/family-trees/${familyTreeId}/members/${member.id}`}
                  className="block"
                >
                  {renderMemberCard(member)}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getGenerationColor(generation: number): string {
  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Blue
    "#96CEB4", // Green
    "#FFEEAD", // Yellow
    "#D4A5A5", // Pink
    "#9B59B6", // Purple
    "#3498DB", // Light Blue
    "#E67E22", // Orange
    "#2ECC71", // Emerald
  ];
  return colors[(generation - 1) % colors.length];
}
