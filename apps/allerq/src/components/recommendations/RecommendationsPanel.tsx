'use client';

import { useState, useEffect } from 'react';
import { RecommendationsService, MenuInsights } from '@kitchen-os/database';
import { Button } from '@kitchen-os/ui';
import {
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  Star,
  DollarSign,
  BarChart3,
  Target,
  Leaf,
  Calendar,
} from 'lucide-react';

interface RecommendationsPanelProps {
  restaurantId: string;
  menuId?: string;
  dateRange?: { startDate: Date; endDate: Date };
  onRecommendationApplied?: (recommendationId: string) => void;
}

export function RecommendationsPanel({
  restaurantId,
  menuId,
  dateRange,
  onRecommendationApplied,
}: RecommendationsPanelProps) {
  const [insights, setInsights] = useState<MenuInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [restaurantId, menuId, dateRange]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await RecommendationsService.generateMenuRecommendations(
        restaurantId,
        menuId,
        dateRange
      );
      
      setInsights(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'promote':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'reposition':
        return <Target className="h-5 w-5 text-blue-600" />;
      case 'remove':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'price_adjust':
        return <DollarSign className="h-5 w-5 text-purple-600" />;
      case 'allergen_alternative':
        return <Leaf className="h-5 w-5 text-green-600" />;
      case 'seasonal':
        return <Calendar className="h-5 w-5 text-orange-600" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const dismissRecommendation = (recommendationId: string) => {
    setDismissedRecommendations(prev => new Set([...prev, recommendationId]));
  };

  const applyRecommendation = (recommendationId: string) => {
    // In a real implementation, this would apply the recommendation
    onRecommendationApplied?.(recommendationId);
    dismissRecommendation(recommendationId);
  };

  const getPerformanceScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-kitchen-os-600 mr-3" />
          <span className="text-gray-600">Analyzing menu performance...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 mb-4">Failed to load recommendations: {error}</p>
          <Button variant="outline" onClick={loadRecommendations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No recommendations available yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Create menus and generate QR codes to get AI-powered insights.
          </p>
        </div>
      </div>
    );
  }

  const visibleRecommendations = insights.recommendations.filter(
    rec => !dismissedRecommendations.has(rec.id)
  );

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Menu Performance</h3>
          <Button variant="outline" size="sm" onClick={loadRecommendations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getPerformanceScoreColor(insights.performanceScore)}`}>
              {insights.performanceScore}
            </div>
            <div className="text-sm text-gray-600">Performance Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {insights.totalRecommendations}
            </div>
            <div className="text-sm text-gray-600">Total Recommendations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {insights.highPriorityCount}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
        </div>

        {/* Top Performers */}
        {insights.summary.topPerformers.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Top Performers</h4>
            <div className="flex flex-wrap gap-2">
              {insights.summary.topPerformers.slice(0, 3).map((item) => (
                <div
                  key={item.itemId}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  <Star className="inline h-3 w-3 mr-1" />
                  {item.name} ({item.score.toFixed(1)}%)
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Opportunities */}
        {insights.summary.opportunities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Key Opportunities</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {insights.summary.opportunities.slice(0, 3).map((opportunity, index) => (
                <li key={index} className="flex items-start">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  {opportunity}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
          <p className="text-sm text-gray-600 mt-1">
            Optimize your menu based on customer behavior and performance data
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {visibleRecommendations.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">All recommendations have been addressed!</p>
              <p className="text-sm text-gray-500 mt-1">
                Your menu is performing well. Check back later for new insights.
              </p>
            </div>
          ) : (
            visibleRecommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className={`p-6 border-l-4 ${getPriorityColor(recommendation.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getRecommendationIcon(recommendation.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {recommendation.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(recommendation.priority)}`}>
                          {recommendation.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">
                        {recommendation.description}
                      </p>
                      
                      <div className="text-sm text-green-600 mb-2">
                        <strong>Impact:</strong> {recommendation.impact}
                      </div>
                      
                      <div className="text-sm text-blue-600">
                        <strong>Action:</strong> {recommendation.actionRequired}
                      </div>

                      {/* Expanded Details */}
                      {expandedRecommendation === recommendation.id && recommendation.data && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Details</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            {recommendation.data.currentPrice && (
                              <div>Current Price: ${recommendation.data.currentPrice}</div>
                            )}
                            {recommendation.data.suggestedPrice && (
                              <div>Suggested Price: ${recommendation.data.suggestedPrice}</div>
                            )}
                            {recommendation.data.clickRate && (
                              <div>Click Rate: {recommendation.data.clickRate.toFixed(1)}%</div>
                            )}
                            {recommendation.data.currentPosition && (
                              <div>Current Position: #{recommendation.data.currentPosition}</div>
                            )}
                            {recommendation.data.suggestedPosition && (
                              <div>Suggested Position: #{recommendation.data.suggestedPosition}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedRecommendation(
                        expandedRecommendation === recommendation.id ? null : recommendation.id
                      )}
                    >
                      {expandedRecommendation === recommendation.id ? 'Less' : 'More'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyRecommendation(recommendation.id)}
                    >
                      Apply
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissRecommendation(recommendation.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
