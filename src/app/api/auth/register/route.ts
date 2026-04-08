import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    + "-" + Math.random().toString(36).substring(2, 7);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, firstName, lastName, phone,
            businessName, businessCategory, businessAddress, businessPhone, businessDescription } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (role === "PROFESSIONAL") {
      if (!businessName || !businessCategory) {
        return NextResponse.json({ error: "Nom et catégorie du commerce requis" }, { status: 400 });
      }
      const slug = slugify(businessName);
      const user = await prisma.user.create({
        data: {
          email,
          name: name || businessName,
          passwordHash,
          role: "PROFESSIONAL",
          business: {
            create: {
              name: businessName,
              slug,
              category: businessCategory,
              address: businessAddress,
              phone: businessPhone,
              description: businessDescription,
            },
          },
        },
        include: { business: true },
      });
      return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } }, { status: 201 });
    } else {
      if (!firstName || !lastName) {
        return NextResponse.json({ error: "Prénom et nom requis" }, { status: 400 });
      }
      const user = await prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          passwordHash,
          role: "CUSTOMER",
          customer: {
            create: {
              firstName,
              lastName,
              phone,
            },
          },
        },
      });
      return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } }, { status: 201 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
