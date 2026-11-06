package com.tripnest.dto.ai;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BudgetAnalysisResponse {
    private double totalBudget;
    private double totalEstimatedCost;
    private double totalActualSpent;
    private double remainingBudget;
    private double percentageSpent;
    private boolean isOverBudget;
    private double overspentAmount;
    private Map<String, Double> categoryEstimates = new HashMap<>();
    private Map<String, Double> categoryActuals = new HashMap<>();
    private List<String> spendingAlerts = new ArrayList<>();
    private List<String> costOptimizationTips = new ArrayList<>();
    private List<String> lowerCostAlternatives = new ArrayList<>();
    private String sourceNotice;

    public BudgetAnalysisResponse() {}

    public double getTotalBudget() { return totalBudget; }
    public void setTotalBudget(double totalBudget) { this.totalBudget = totalBudget; }

    public double getTotalEstimatedCost() { return totalEstimatedCost; }
    public void setTotalEstimatedCost(double totalEstimatedCost) { this.totalEstimatedCost = totalEstimatedCost; }

    public double getTotalActualSpent() { return totalActualSpent; }
    public void setTotalActualSpent(double totalActualSpent) { this.totalActualSpent = totalActualSpent; }

    public double getRemainingBudget() { return remainingBudget; }
    public void setRemainingBudget(double remainingBudget) { this.remainingBudget = remainingBudget; }

    public double getPercentageSpent() { return percentageSpent; }
    public void setPercentageSpent(double percentageSpent) { this.percentageSpent = percentageSpent; }

    public boolean isOverBudget() { return isOverBudget; }
    public void setOverBudget(boolean overBudget) { isOverBudget = overBudget; }

    public double getOverspentAmount() { return overspentAmount; }
    public void setOverspentAmount(double overspentAmount) { this.overspentAmount = overspentAmount; }

    public Map<String, Double> getCategoryEstimates() { return categoryEstimates; }
    public void setCategoryEstimates(Map<String, Double> categoryEstimates) { this.categoryEstimates = categoryEstimates; }

    public Map<String, Double> getCategoryActuals() { return categoryActuals; }
    public void setCategoryActuals(Map<String, Double> categoryActuals) { this.categoryActuals = categoryActuals; }

    public List<String> getSpendingAlerts() { return spendingAlerts; }
    public void setSpendingAlerts(List<String> spendingAlerts) { this.spendingAlerts = spendingAlerts; }

    public List<String> getCostOptimizationTips() { return costOptimizationTips; }
    public void setCostOptimizationTips(List<String> costOptimizationTips) { this.costOptimizationTips = costOptimizationTips; }

    public List<String> getLowerCostAlternatives() { return lowerCostAlternatives; }
    public void setLowerCostAlternatives(List<String> lowerCostAlternatives) { this.lowerCostAlternatives = lowerCostAlternatives; }

    public String getSourceNotice() { return sourceNotice; }
    public void setSourceNotice(String sourceNotice) { this.sourceNotice = sourceNotice; }
}