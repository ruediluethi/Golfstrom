clear;
close all;


T_0 = 1;
S_0 = 1;

T = [T_0];
S = [S_0];

alpha = 1.1;
beta = 0.9;
gamma = 1.2;

Q = [alpha*T_0 - beta*S_0];

dt = .1;
t = [1];
amount_of_iterations = 10;
for i = [1:amount_of_iterations/dt]
    
    q = alpha*T(end) - beta*S(end);
    
    dT = ( (1 - T(end)) - abs(q)*T(end) )*dt;
    dS = ( gamma*(1 - S(end)) - abs(q)*S(end) )*dt;
    
    T(end+1) = T(end) + dT;
    S(end+1) = S(end) + dS;
    Q(end+1) = q*dt;
    
    t(end+1) = t(end) + 1; % increment the time
end

plot(t,T,t,S,t,Q);
legend('Temperatur','Salz','Fluss');