import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp, Shield, Heart, Briefcase, GraduationCap, Home } from 'lucide-react';

const Schemes = () => {
  const governmentSchemes = [
    {
      id: 1,
      title: "Sukanya Samriddhi Yojana",
      category: "Education & Marriage",
      description: "A savings scheme for the girl child, offering attractive interest rates and tax benefits for education and marriage expenses.",
      benefits: [
        "Tax deduction up to ₹1.5 lakh under Section 80C",
        "Current interest rate: 8.2% per annum",
        "Tax-free maturity amount",
        "Partial withdrawals allowed for education"
      ],
      eligibility: "Girl child below 10 years of age",
      icon: <GraduationCap className="h-6 w-6" />,
      officialLink: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=61",
      color: "prosperity"
    },
    {
      id: 2,
      title: "PM Jan Dhan Yojana",
      category: "Banking & Financial Inclusion",
      description: "A financial inclusion program to provide banking services to all households with zero balance bank accounts.",
      benefits: [
        "Zero minimum balance account",
        "Free RuPay debit card",
        "Accident insurance cover of ₹2 lakh",
        "Life insurance cover of ₹30,000",
        "Overdraft facility up to ₹10,000"
      ],
      eligibility: "All Indian citizens above 18 years",
      icon: <Shield className="h-6 w-6" />,
      officialLink: "https://pmjdy.gov.in/",
      color: "trust"
    },
    {
      id: 3,
      title: "Stand-Up India",
      category: "Entrepreneurship",
      description: "Facilitates bank loans between ₹10 lakh and ₹1 crore to SC/ST and women entrepreneurs for setting up new enterprises.",
      benefits: [
        "Loans from ₹10 lakh to ₹1 crore",
        "Lower interest rates for women entrepreneurs",
        "Composite loans for manufacturing/services/trading",
        "Handholding support and mentoring"
      ],
      eligibility: "Women and SC/ST entrepreneurs above 18 years",
      icon: <Briefcase className="h-6 w-6" />,
      officialLink: "https://www.standupmitra.in/",
      color: "warm-gold"
    },
    {
      id: 4,
      title: "Mahila E-Haat",
      category: "Digital Marketplace",
      description: "An online marketing platform for women entrepreneurs to showcase and sell their products directly to customers.",
      benefits: [
        "Direct market access for women entrepreneurs",
        "Zero commission on initial sales",
        "Online training and support",
        "Quality certification assistance"
      ],
      eligibility: "Women entrepreneurs and SHG members",
      icon: <Heart className="h-6 w-6" />,
      officialLink: "https://mahilaehaat.gov.in/",
      color: "success"
    },
    {
      id: 5,
      title: "Pradhan Mantri Awas Yojana",
      category: "Housing",
      description: "Affordable housing scheme providing financial assistance for construction/enhancement of houses.",
      benefits: [
        "Subsidy on home loans up to ₹2.67 lakh",
        "Interest subsidy for 20 years",
        "Priority for women ownership",
        "Additional support for SC/ST families"
      ],
      eligibility: "Families with annual income up to ₹18 lakh",
      icon: <Home className="h-6 w-6" />,
      officialLink: "https://pmaymis.gov.in/",
      color: "prosperity"
    },
    {
      id: 6,
      title: "Atal Pension Yojana",
      category: "Pension & Retirement",
      description: "A pension scheme providing guaranteed pension ranging from ₹1,000 to ₹5,000 per month after 60 years of age.",
      benefits: [
        "Guaranteed pension from ₹1,000 to ₹5,000",
        "Government co-contribution for eligible subscribers",
        "Tax benefits under Section 80CCD",
        "Pension continues to spouse after subscriber's death"
      ],
      eligibility: "Citizens aged 18-40 years with bank account",
      icon: <TrendingUp className="h-6 w-6" />,
      officialLink: "https://npscra.nsdl.co.in/nps-trust/apy.php",
      color: "trust"
    }
  ];

  const getColorClass = (color: string) => {
    switch (color) {
      case 'prosperity':
        return 'text-prosperity bg-prosperity/10 border-prosperity/20';
      case 'trust':
        return 'text-trust-dark bg-trust/10 border-trust/20';
      case 'success':
        return 'text-success bg-success/10 border-success/20';
      case 'warm-gold':
        return 'text-warm-gold-foreground bg-warm-gold/10 border-warm-gold/20';
      default:
        return 'text-prosperity bg-prosperity/10 border-prosperity/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-trust">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-prosperity mb-4">Government Schemes & Programs</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore various government initiatives designed to empower women through financial inclusion, 
            entrepreneurship support, and social security benefits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {governmentSchemes.map((scheme) => (
            <Card key={scheme.id} className="shadow-soft border-0 hover:shadow-prosperity transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${getColorClass(scheme.color)}`}>
                    {scheme.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {scheme.category}
                  </Badge>
                </div>
                <CardTitle className="text-prosperity text-lg">{scheme.title}</CardTitle>
                <CardDescription className="text-sm">
                  {scheme.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-prosperity-light mb-2 text-sm">Key Benefits:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {scheme.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-prosperity mr-2">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-prosperity-light mb-1 text-sm">Eligibility:</h4>
                  <p className="text-xs text-muted-foreground">{scheme.eligibility}</p>
                </div>

                <Button 
                  variant="prosperity-outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open(scheme.officialLink, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Information Section */}
        <Card className="shadow-soft border-0 mt-12">
          <CardHeader>
            <CardTitle className="text-prosperity text-center">How to Apply for These Schemes</CardTitle>
            <CardDescription className="text-center">
              General guidelines for applying to government schemes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-prosperity/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-prosperity font-bold">1</span>
                </div>
                <h3 className="font-semibold text-prosperity">Visit Official Website</h3>
                <p className="text-sm text-muted-foreground">
                  Click on "Learn More" to visit the official government website for each scheme
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-prosperity/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-prosperity font-bold">2</span>
                </div>
                <h3 className="font-semibold text-prosperity">Check Eligibility</h3>
                <p className="text-sm text-muted-foreground">
                  Verify that you meet the eligibility criteria mentioned for each scheme
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-prosperity/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-prosperity font-bold">3</span>
                </div>
                <h3 className="font-semibold text-prosperity">Apply Online/Offline</h3>
                <p className="text-sm text-muted-foreground">
                  Complete the application process as per the guidelines on the official website
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Schemes;