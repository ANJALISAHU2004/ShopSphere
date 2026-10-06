import AdminOrdersTable from '../components/admin/AdminOrdersTable.jsx';
import AdminTabs from '../components/layout/AdminTabs.jsx';

/** Composes administrator order status management. */
export default function AdminOrdersPage() {
  return (
    <section className="admin-page" aria-labelledby="admin-orders-title">
      <header className="admin-page__header">
        <h1 id="admin-orders-title">Order management</h1>
      </header>
      <AdminTabs />
      <AdminOrdersTable />
    </section>
  );
}
