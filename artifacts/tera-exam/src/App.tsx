import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import { PublicLayout } from '@/components/layout/public-layout';
import { AdminLayout } from '@/components/layout/admin-layout';

import { ScrollToTop } from '@/components/layout/scroll-to-top';

// Setup Auth Token Getter
setAuthTokenGetter(() => localStorage.getItem('tera_exam_admin_token') || '');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

import Home from '@/pages/public/home';
import AdminLogin from '@/pages/admin/login';
import AdminDashboard from '@/pages/admin/dashboard';
import AdminScraped from '@/pages/admin/scraped-items';

import AdminJobs from '@/pages/admin/jobs';
import AdminResults from '@/pages/admin/results';
import AdminAdmitCards from '@/pages/admin/admit-cards';

import AdminSyllabus from '@/pages/admin/syllabus';
import AdminExamPrep from '@/pages/admin/exam-prep';

import { NotFound } from '@/pages/not-found';
import AdmitCardDetail from './pages/public/admit-card-detail';
import AdmitCardsList from './pages/public/admit-cards-list';
import JobDetail from './pages/public/job-detail';
import ExamPrepSession from './pages/public/exam-prep-session';
import ExamPrepSubjects from './pages/public/exam-prep-subjects';
import ExamPrepTopics from './pages/public/exam-prep-topics';
import JobsList from './pages/public/jobs-list';
import ResultDetail from './pages/public/result-detail';
import ResultsList from './pages/public/results-list';
import SyllabusList from './pages/public/syllabus-list';

function PublicRoutes() {
  return (
    <PublicLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/jobs" component={JobsList} />
        <Route path="/jobs/:id" component={JobDetail} />
        <Route path="/results" component={ResultsList} />
        <Route path="/results/:id" component={ResultDetail} />
        <Route path="/admit-cards" component={AdmitCardsList} />
        <Route path="/admit-cards/:id" component={AdmitCardDetail} />
        <Route path="/syllabus" component={SyllabusList} />
        <Route path="/exam-prep" component={ExamPrepSubjects} />
        <Route path="/exam-prep/:subjectId" component={ExamPrepTopics} />
        <Route path="/exam-prep/:subjectId/:topicId" component={ExamPrepSession} />
        <Route component={NotFound} />
      </Switch>
    </PublicLayout>
  );
}

function AdminRoutes() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/*">
        <AdminLayout>
          <Switch>
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/jobs" component={AdminJobs} />
            <Route path="/admin/results" component={AdminResults} />
            <Route path="/admin/admit-cards" component={AdminAdmitCards} />
            <Route path="/admin/syllabus" component={AdminSyllabus} />
            <Route path="/admin/exam-prep" component={AdminExamPrep} />
            <Route path="/admin/scraped-items" component={AdminScraped} />
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <ScrollToTop />
          <Switch>
            <Route path="/admin/*" component={AdminRoutes} />
            <Route path="/admin" component={AdminRoutes} />
            <Route path="/*" component={PublicRoutes} />
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
