import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getMemberSession, getMemberOrders, getMemberWishlist } from "@/app/actions/member-actions";
import { MemberDashboard } from "@/components/member-dashboard";

export const metadata = { title: "My Vault | Vault 6 Studios" };

export default async function MemberPage() {
  const user = await getMemberSession();
  if (!user) redirect("/login?next=/member");

  const [ordersRes, wishlistRes] = await Promise.all([
    getMemberOrders(),
    getMemberWishlist(),
  ]);

  const orders = (ordersRes.success ? ordersRes.data ?? [] : []).map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    total: o.total,
    subtotal: o.subtotal,
    shipping: o.shipping,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map(i => ({
      id: i.id,
      artifactId: i.artifactId,
      artifactName: i.artifactName,
      price: i.price,
      quantity: i.quantity,
    })),
  }));

  const wishlist = (wishlistRes.success ? wishlistRes.data ?? [] : []).map(w => ({
    id: w.id,
    artifactId: w.artifactId,
    createdAt: w.createdAt.toISOString(),
    artifact: {
      id: w.artifact.id,
      deploymentId: w.artifact.deploymentId,
      name: w.artifact.name,
      category: w.artifact.category,
      price: w.artifact.price,
      status: w.artifact.status,
      imageUrls: w.artifact.imageUrls,
      series: w.artifact.series,
    },
  }));

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <div className="flex-1 pt-28 md:pt-36 pb-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <MemberDashboard
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              address: user.address,
              city: user.city,
              state: user.state,
              zip: user.zip,
              country: user.country,
              isPublicProfile: user.isPublicProfile,
              operativeName: user.operativeName ?? "",
              createdAt: user.createdAt.toISOString(),
            }}
            orders={orders}
            wishlist={wishlist}
          />
        </div>
      </div>
      <Footer />
    </main>
  );
}
