import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, TrendingUp, Shield, Heart, IndianRupee, CheckCircle, Mail } from 'lucide-react';

const Index = () => {
  const authContext = useAuth();
  const { t, language } = useLanguage();

  // Handle case where context is not available during hot reload
  if (!authContext) {
    return null;
  }

  const { user } = authContext;

  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: t('features.community'),
      description: t('features.community.desc')
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: t('features.investment'),
      description: t('features.investment.desc')
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('features.secure'),
      description: t('features.secure.desc')
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: t('features.empowerment'),
      description: t('features.empowerment.desc')
    }
  ];

  const benefits = [
    t('benefits.zeroFees'),
    t('benefits.flexible'),
    t('benefits.emergency'),
    t('benefits.literacy'),
    t('benefits.government'),
    t('benefits.community')
  ];

  return (
    <div className="min-h-screen bg-gradient-trust">
      {/* Main Heading */}
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-prosperity">
          Sushirmala Mahila Bachat Gat
        </h1>
      </div>
      
      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4 bg-warm-gold/10 text-warm-gold-foreground border-warm-gold/20">
              {t('home.subtitle')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-prosperity mb-6">
              {t('home.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('home.description')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user ? (
              <Link to="/dashboard">
                <Button variant="prosperity" size="lg" className="min-w-[200px]">
                  {t('navbar.dashboard')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="prosperity" size="lg" className="min-w-[200px]">
                    {t('home.join')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="prosperity-outline" size="lg" className="min-w-[200px]">
                    {t('home.signin')}
                  </Button>
                </Link>
                <Link to="/enquiry">
                  <Button variant="outline" size="lg" className="min-w-[200px]">
                    <Mail className="mr-2 h-5 w-5" />
                    {t('home.enquire')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-prosperity">100+</div>
              <div className="text-muted-foreground">{t('home.stats.members')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-prosperity flex items-center justify-center">
                <IndianRupee className="h-6 w-6" />5L+
              </div>
              <div className="text-muted-foreground">{t('home.stats.savings')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-prosperity">3+</div>
              <div className="text-muted-foreground">{t('home.stats.groups')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-prosperity mb-4">{t('features.community')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('features.community.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-soft border-0 text-center hover:shadow-prosperity transition-all duration-300">
                <CardHeader>
                  <div className="text-prosperity mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-prosperity">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-trust/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-prosperity mb-6">
                {t('benefits.title')}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t('benefits.desc')}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="shadow-prosperity border-0">
              <CardHeader>
                <CardTitle className="text-prosperity">{t('dashboard.join')}</CardTitle>
                <CardDescription>
                  {t('dashboard.join.desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-prosperity/20 rounded-full flex items-center justify-center">
                      <span className="text-prosperity font-bold text-sm">1</span>
                    </div>
                    <span className="text-sm">{t('dashboard.community')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-prosperity/20 rounded-full flex items-center justify-center">
                      <span className="text-prosperity font-bold text-sm">2</span>
                    </div>
                    <span className="text-sm">{t('dashboard.savings')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-prosperity/20 rounded-full flex items-center justify-center">
                      <span className="text-prosperity font-bold text-sm">3</span>
                    </div>
                    <span className="text-sm">{t('dashboard.skill')}</span>
                  </div>
                </div>

                {!user && (
                  <Link to="/register" className="block">
                    <Button variant="prosperity" className="w-full">
                      {t('home.join')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Join Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-prosperity">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-prosperity-foreground mb-4">
            {t('enquiry.title')}
          </h2>
          <p className="text-prosperity-foreground/90 mb-8 max-w-2xl mx-auto">
            {t('enquiry.desc')}
          </p>
          
          <Link to="/enquiry">
            <Button variant="trust" size="lg" className="gap-2">
              <Mail className="h-5 w-5" />
              {t('enquiry.submit')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-4 bg-white rounded-lg shadow-soft">
              <div className="w-12 h-12 bg-prosperity/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-prosperity font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold mb-2">{t('enquiry.step1')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('enquiry.step1.desc')}
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-soft">
              <div className="w-12 h-12 bg-prosperity/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-prosperity font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold mb-2">{t('enquiry.step2')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('enquiry.step2.desc')}
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-soft">
              <div className="w-12 h-12 bg-prosperity/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-prosperity font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold mb-2">{t('enquiry.step3')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('enquiry.step3.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bachat Gats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-trust/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-prosperity mb-4">{t('gats.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('gats.desc')}
            </p>
          </div>
          
          <div className="mb-8 text-center">
            <Link to="/dashboard">
              <Button variant="prosperity" size="lg" className="mr-4">
                {t('gats.view')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            {!user && (
              <Link to="/enquiry">
                <Button variant="outline" size="lg">
                  <Mail className="mr-2 h-5 w-5" />
                  {t('gats.enquire')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;