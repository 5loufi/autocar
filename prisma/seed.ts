import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const vehicules = await Promise.all([
    prisma.vehicule.create({
      data: {
        marque: "Toyota", modele: "Corolla", annee: 2022,
        immatriculation: "234-A-50", couleur: "Blanc",
        kilometrage: 18000, prixJour: 450, caution: 3000,
        statut: "DISPONIBLE",
      },
    }),
    prisma.vehicule.create({
      data: {
        marque: "Dacia", modele: "Logan", annee: 2021,
        immatriculation: "789-B-22", couleur: "Gris",
        kilometrage: 35000, prixJour: 300, caution: 2000,
        statut: "LOUE",
      },
    }),
    prisma.vehicule.create({
      data: {
        marque: "Hyundai", modele: "i30", annee: 2023,
        immatriculation: "102-C-11", couleur: "Noir",
        kilometrage: 8000, prixJour: 500, caution: 4000,
        statut: "DISPONIBLE",
      },
    }),
    prisma.vehicule.create({
      data: {
        marque: "Renault", modele: "Clio", annee: 2020,
        immatriculation: "456-D-88", couleur: "Rouge",
        kilometrage: 52000, prixJour: 280, caution: 1500,
        statut: "ENTRETIEN",
      },
    }),
    prisma.vehicule.create({
      data: {
        marque: "Volkswagen", modele: "Polo", annee: 2022,
        immatriculation: "321-E-44", couleur: "Bleu",
        kilometrage: 22000, prixJour: 380, caution: 2500,
        statut: "RESERVE",
      },
    }),
  ]);

  const clients = await Promise.all([
    prisma.client.create({
      data: {
        nom: "Bensalem", prenom: "Karim",
        telephone: "0661234567", email: "karim.bensalem@email.com",
        adresse: "12 Rue Hassan II, Casablanca",
        permisNumero: "A123456", cinNumero: "BE123456",
      },
    }),
    prisma.client.create({
      data: {
        nom: "El Fassi", prenom: "Salma",
        telephone: "0677654321", email: "salma.elfassi@email.com",
        adresse: "45 Boulevard Mohammed V, Rabat",
        permisNumero: "B789012", cinNumero: "EF789012",
      },
    }),
    prisma.client.create({
      data: {
        nom: "Moussaoui", prenom: "Youssef",
        telephone: "0655443322", email: "youssef.moussaoui@email.com",
        adresse: "8 Avenue des FAR, Marrakech",
        permisNumero: "C345678", cinNumero: "MO345678",
      },
    }),
  ]);

  const now = new Date();
  const reservation1 = await prisma.reservation.create({
    data: {
      vehiculeId: vehicules[1].id,
      clientId: clients[0].id,
      dateDepart: new Date(now.getTime() - 3 * 86400000),
      dateRetour: new Date(now.getTime() + 2 * 86400000),
      prixTotal: 1500, caution: 2000,
      statut: "EN_COURS",
    },
  });

  const reservation2 = await prisma.reservation.create({
    data: {
      vehiculeId: vehicules[4].id,
      clientId: clients[1].id,
      dateDepart: new Date(now.getTime() + 1 * 86400000),
      dateRetour: new Date(now.getTime() + 4 * 86400000),
      prixTotal: 1140, caution: 2500,
      statut: "CONFIRMEE",
    },
  });

  await prisma.paiement.create({
    data: {
      reservationId: reservation1.id,
      montant: 1500, modePaiement: "CARTE",
      statut: "PAYE", type: "SOLDE",
    },
  });

  await prisma.paiement.create({
    data: {
      reservationId: reservation2.id,
      montant: 500, modePaiement: "ESPECES",
      statut: "PARTIEL", type: "ACOMPTE",
    },
  });

  await prisma.entretien.create({
    data: {
      vehiculeId: vehicules[3].id,
      date: new Date(),
      type: "Vidange + filtre à huile",
      cout: 450,
      notes: "Vidange complète effectuée",
      prochainRappel: new Date(now.getTime() + 90 * 86400000),
    },
  });

  console.log("✅ Données de démonstration créées avec succès");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
